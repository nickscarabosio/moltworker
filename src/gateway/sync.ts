import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { R2_MOUNT_PATH } from '../config';
import { mountR2Storage } from './r2';
import { runCommandWithCleanup } from './utils';

export interface SyncResult {
  success: boolean;
  lastSync?: string;
  error?: string;
  details?: string;
}

/**
 * Sync OpenClaw config and workspace from container to R2 for persistence.
 *
 * This function:
 * 1. Mounts R2 if not already mounted
 * 2. Verifies source has critical files (prevents overwriting good backup with empty data)
 * 3. Creates tar archives of config, workspace, and skills
 * 4. Copies each archive to R2 (3 file writes instead of hundreds via rsync)
 * 5. Writes a timestamp file for tracking
 *
 * Creates three tar archives in R2:
 * - openclaw-config.tar.gz: /root/.openclaw/ (excluding workspace)
 * - workspace.tar.gz: /root/.openclaw/workspace/ (IDENTITY.md, MEMORY.md, etc.)
 * - skills.tar.gz: /root/clawd/skills/
 *
 * @param sandbox - The sandbox instance
 * @param env - Worker environment bindings
 * @returns SyncResult with success status and optional error details
 */
export async function syncToR2(sandbox: Sandbox, env: MoltbotEnv): Promise<SyncResult> {
  // Check if R2 is configured
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.CF_ACCOUNT_ID) {
    return { success: false, error: 'R2 storage is not configured' };
  }

  // Mount R2 if not already mounted
  const mounted = await mountR2Storage(sandbox, env);
  if (!mounted) {
    return { success: false, error: 'Failed to mount R2 storage' };
  }

  // Determine which config directory exists
  // Use ls (which produces stdout) instead of test -f to avoid exit-code race
  // where fast-exiting processes have exitCode still undefined in the sandbox SDK
  let configDir = '/root/.openclaw';
  try {
    const checkNew = await runCommandWithCleanup(
      sandbox,
      'ls /root/.openclaw/openclaw.json 2>/dev/null && echo FOUND || echo NOTFOUND',
      5000,
    );
    const newFound = checkNew.stdout.includes('FOUND') && !checkNew.stdout.includes('NOTFOUND');
    if (!newFound) {
      const checkLegacy = await runCommandWithCleanup(
        sandbox,
        'ls /root/.clawdbot/clawdbot.json 2>/dev/null && echo FOUND || echo NOTFOUND',
        5000,
      );
      if (checkLegacy.stdout.includes('FOUND') && !checkLegacy.stdout.includes('NOTFOUND')) {
        configDir = '/root/.clawdbot';
      } else {
        return {
          success: false,
          error: 'Sync aborted: no config file found',
          details: 'Neither openclaw.json nor clawdbot.json found in config directory.',
        };
      }
    }
  } catch (err) {
    return {
      success: false,
      error: 'Failed to verify source files',
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  // Use tar archives instead of rsync — s3fs does one HTTP request per file,
  // so rsync with many files is extremely slow. Tar creates a single archive
  // locally then writes one file to R2 (3 writes total instead of hundreds).
  const syncParts = [
    `rm -f ${R2_MOUNT_PATH}/.last-sync`,
    `mkdir -p /root/.openclaw/workspace /root/clawd/skills`,
    // Config: tar locally, copy single file to R2
    `tar czf /tmp/openclaw-config.tar.gz -C ${configDir} --exclude='workspace' --exclude='.git' --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' .`,
    `cp /tmp/openclaw-config.tar.gz ${R2_MOUNT_PATH}/openclaw-config.tar.gz`,
    // Workspace: tar locally, copy single file to R2
    `tar czf /tmp/openclaw-workspace.tar.gz -C /root/.openclaw/workspace --exclude='.git' .`,
    `cp /tmp/openclaw-workspace.tar.gz ${R2_MOUNT_PATH}/workspace.tar.gz`,
    // Skills: tar locally, copy single file to R2
    `tar czf /tmp/openclaw-skills.tar.gz -C /root/clawd/skills --exclude='.git' .`,
    `cp /tmp/openclaw-skills.tar.gz ${R2_MOUNT_PATH}/skills.tar.gz`,
    // Cleanup temp files and write timestamp
    `rm -f /tmp/openclaw-config.tar.gz /tmp/openclaw-workspace.tar.gz /tmp/openclaw-skills.tar.gz`,
    `date -Iseconds > ${R2_MOUNT_PATH}/.last-sync`,
  ];
  const syncCmd = syncParts.join(' && ');

  try {
    const syncResult = await runCommandWithCleanup(sandbox, syncCmd, 60000); // 60s timeout

    // Check for success by reading the NEW timestamp file
    // If the && chain broke, .last-sync won't exist (we deleted it above)
    const timestampResult = await runCommandWithCleanup(sandbox, `cat ${R2_MOUNT_PATH}/.last-sync 2>/dev/null || echo MISSING`, 5000);
    const lastSync = timestampResult.stdout.trim();

    if (lastSync && lastSync.match(/^\d{4}-\d{2}-\d{2}/) && !lastSync.includes('MISSING')) {
      return { success: true, lastSync };
    } else {
      return {
        success: false,
        error: 'Sync failed',
        details: syncResult.stderr || syncResult.stdout || 'Tar/copy chain failed — timestamp not written',
      };
    }
  } catch (err) {
    return {
      success: false,
      error: 'Sync error',
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
