import { Hono } from 'hono';
import type { AppEnv, MoltbotEnv } from '../types';

/**
 * CDP (Chrome DevTools Protocol) WebSocket proxy
 * 
 * Acts as a pass-through proxy between clients and the Cloudflare Browser Rendering API.
 * Handles the chunking protocol required by Browser Rendering WebSocket connections.
 * 
 * Authentication: Pass secret as query param `?secret=<secret>` on WebSocket connect.
 * This route is intentionally NOT protected by Cloudflare Access.
 */

// Constants for Browser Rendering API
const FAKE_HOST = 'https://fake.host';
const PING_INTERVAL_MS = 1000;

// Chunking protocol constants
// https://github.com/cloudflare/puppeteer/blob/main/packages/puppeteer-core/src/cloudflare/chunking.ts
const HEADER_SIZE = 4; // Uint32
const MAX_MESSAGE_SIZE = 1048575; // Workers size is < 1MB
const FIRST_CHUNK_DATA_SIZE = MAX_MESSAGE_SIZE - HEADER_SIZE;

/**
 * Convert a string message to chunked Uint8Array format for Browser Rendering WebSocket
 */
function messageToChunks(data: string): Uint8Array[] {
  const encoder = new TextEncoder();
  const encodedUint8Array = encoder.encode(data);

  // We only include the header into the first chunk
  const firstChunk = new Uint8Array(Math.min(MAX_MESSAGE_SIZE, HEADER_SIZE + encodedUint8Array.length));
  const view = new DataView(firstChunk.buffer);
  view.setUint32(0, encodedUint8Array.length, true);
  firstChunk.set(encodedUint8Array.slice(0, FIRST_CHUNK_DATA_SIZE), HEADER_SIZE);

  const chunks: Uint8Array[] = [firstChunk];
  for (let i = FIRST_CHUNK_DATA_SIZE; i < encodedUint8Array.length; i += MAX_MESSAGE_SIZE) {
    chunks.push(encodedUint8Array.slice(i, i + MAX_MESSAGE_SIZE));
  }
  return chunks;
}

/**
 * Reassemble chunked messages from Browser Rendering WebSocket into string messages
 */
function chunksToMessage(chunks: Uint8Array[], sessionId: string): string | null {
  if (chunks.length === 0) {
    return null;
  }

  const emptyBuffer = new Uint8Array(0);
  const firstChunk = chunks[0] || emptyBuffer;
  const view = new DataView(firstChunk.buffer);
  const expectedBytes = view.getUint32(0, true);

  let totalBytes = -HEADER_SIZE;
  for (let i = 0; i < chunks.length; ++i) {
    const curChunk = chunks[i] || emptyBuffer;
    totalBytes += curChunk.length;

    if (totalBytes > expectedBytes) {
      throw new Error(`Should have gotten the exact number of bytes but we got more. SessionID: ${sessionId}`);
    }
    if (totalBytes === expectedBytes) {
      const chunksToCombine = chunks.splice(0, i + 1);
      chunksToCombine[0] = firstChunk.subarray(HEADER_SIZE);

      const combined = new Uint8Array(expectedBytes);
      let offset = 0;
      for (let j = 0; j <= i; ++j) {
        const chunk = chunksToCombine[j] || emptyBuffer;
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      const decoder = new TextDecoder();
      return decoder.decode(combined);
    }
  }
  return null;
}

/**
 * Acquire a new browser session from Browser Rendering API
 */
async function acquireSession(browser: Fetcher, keepAlive?: number): Promise<string> {
  const searchParams = new URLSearchParams();
  if (keepAlive) {
    searchParams.set('keep_alive', String(keepAlive));
  }

  const acquireUrl = `${FAKE_HOST}/v1/acquire?${searchParams.toString()}`;
  const res = await browser.fetch(acquireUrl);
  const status = res.status;
  const text = await res.text();

  if (status !== 200) {
    throw new Error(`Failed to acquire browser session: ${status}: ${text}`);
  }

  const data = JSON.parse(text) as { sessionId: string };
  return data.sessionId;
}

/**
 * Connect to browser DevTools via WebSocket with chunking protocol
 */
async function connectToBrowser(browser: Fetcher, sessionId: string): Promise<WebSocket> {
  const path = `${FAKE_HOST}/v1/connectDevtools?browser_session=${sessionId}`;
  const response = await browser.fetch(path, {
    headers: {
      Upgrade: 'websocket',
    },
  });

  if (!response.webSocket) {
    throw new Error('WebSocket upgrade failed - no webSocket in response');
  }

  response.webSocket.accept();
  return response.webSocket;
}

/**
 * Bridge client WebSocket to browser WebSocket with chunking protocol
 */
function bridgeWebSockets(
  clientWs: WebSocket,
  browserWs: WebSocket,
  sessionId: string
): void {
  const browserChunks: Uint8Array[] = [];
  let pingInterval: ReturnType<typeof setInterval> | null = null;

  // Keep browser connection alive with pings
  pingInterval = setInterval(() => {
    try {
      browserWs.send('ping');
    } catch {
      // Ignore ping errors - connection may be closed
    }
  }, PING_INTERVAL_MS);

  const cleanup = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  };

  // Client -> Browser: chunk the message
  clientWs.addEventListener('message', (event) => {
    try {
      const message = event.data as string;
      console.log('[CDP Proxy] Client -> Browser:', message.substring(0, 200));
      
      const chunks = messageToChunks(message);
      for (const chunk of chunks) {
        browserWs.send(chunk);
      }
    } catch (err) {
      console.error('[CDP Proxy] Error forwarding to browser:', err);
    }
  });

  // Browser -> Client: de-chunk the message
  browserWs.addEventListener('message', (event) => {
    try {
      browserChunks.push(new Uint8Array(event.data as ArrayBuffer));
      const message = chunksToMessage(browserChunks, sessionId);
      if (message) {
        console.log('[CDP Proxy] Browser -> Client:', message.substring(0, 200));
        clientWs.send(message);
      }
    } catch (err) {
      console.error('[CDP Proxy] Error forwarding to client:', err);
    }
  });

  // Handle client close
  clientWs.addEventListener('close', (event) => {
    console.log('[CDP Proxy] Client WebSocket closed:', event.code, event.reason);
    cleanup();
    try {
      browserWs.close(event.code, event.reason);
    } catch {
      // Ignore close errors
    }
  });

  // Handle client error
  clientWs.addEventListener('error', (event) => {
    console.error('[CDP Proxy] Client WebSocket error:', event);
    cleanup();
    try {
      browserWs.close(1011, 'Client error');
    } catch {
      // Ignore close errors
    }
  });

  // Handle browser close
  browserWs.addEventListener('close', (event) => {
    console.log('[CDP Proxy] Browser WebSocket closed:', event.code, event.reason);
    cleanup();
    try {
      clientWs.close(event.code, event.reason);
    } catch {
      // Ignore close errors
    }
  });

  // Handle browser error
  browserWs.addEventListener('error', (event) => {
    console.error('[CDP Proxy] Browser WebSocket error:', event);
    cleanup();
    try {
      clientWs.close(1011, 'Browser error');
    } catch {
      // Ignore close errors
    }
  });
}

/**
 * Initialize CDP proxy session
 */
async function initCDPProxy(clientWs: WebSocket, env: MoltbotEnv): Promise<void> {
  try {
    // Acquire browser session
    console.log('[CDP Proxy] Acquiring browser session...');
    const sessionId = await acquireSession(env.BROWSER!);
    console.log('[CDP Proxy] Session acquired:', sessionId);

    // Connect to browser DevTools
    console.log('[CDP Proxy] Connecting to browser...');
    const browserWs = await connectToBrowser(env.BROWSER!, sessionId);
    console.log('[CDP Proxy] Connected to browser');

    // Bridge the connections
    bridgeWebSockets(clientWs, browserWs, sessionId);
  } catch (err) {
    console.error('[CDP Proxy] Failed to initialize:', err);
    clientWs.close(1011, err instanceof Error ? err.message : 'Failed to initialize browser session');
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Create Hono app for CDP routes
const cdp = new Hono<AppEnv>();

/**
 * GET /cdp - WebSocket upgrade endpoint
 * 
 * Connect with: ws://host/cdp?secret=<CDP_SECRET>
 */
cdp.get('/', async (c) => {
  // Check for WebSocket upgrade
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader?.toLowerCase() !== 'websocket') {
    return c.json({
      error: 'WebSocket upgrade required',
      hint: 'Connect via WebSocket: ws://host/cdp?secret=<CDP_SECRET>',
      description: 'This endpoint proxies CDP commands to Cloudflare Browser Rendering',
    });
  }

  // Verify secret from query param
  const url = new URL(c.req.url);
  const providedSecret = url.searchParams.get('secret');
  const expectedSecret = c.env.CDP_SECRET;

  if (!expectedSecret) {
    return c.json({
      error: 'CDP endpoint not configured',
      hint: 'Set CDP_SECRET via: wrangler secret put CDP_SECRET',
    }, 503);
  }

  if (!providedSecret || !timingSafeEqual(providedSecret, expectedSecret)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!c.env.BROWSER) {
    return c.json({
      error: 'Browser Rendering not configured',
      hint: 'Add browser binding to wrangler.jsonc',
    }, 503);
  }

  // Create WebSocket pair
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  // Accept the WebSocket
  server.accept();

  // Initialize CDP proxy asynchronously
  initCDPProxy(server, c.env).catch((err) => {
    console.error('[CDP Proxy] Initialization failed:', err);
    server.close(1011, 'Failed to initialize browser session');
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
});

/**
 * GET /json/version - CDP discovery endpoint
 * 
 * Returns browser version info and WebSocket URL for compatibility with tools like Playwright.
 * Authentication: Pass secret as query param `?secret=<CDP_SECRET>`
 */
cdp.get('/json/version', async (c) => {
  // Verify secret from query param
  const url = new URL(c.req.url);
  const providedSecret = url.searchParams.get('secret');
  const expectedSecret = c.env.CDP_SECRET;

  if (!expectedSecret) {
    return c.json({
      error: 'CDP endpoint not configured',
      hint: 'Set CDP_SECRET via: wrangler secret put CDP_SECRET',
    }, 503);
  }

  if (!providedSecret || !timingSafeEqual(providedSecret, expectedSecret)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!c.env.BROWSER) {
    return c.json({
      error: 'Browser Rendering not configured',
      hint: 'Add browser binding to wrangler.jsonc',
    }, 503);
  }

  // Build the WebSocket URL - preserve the secret in the WS URL
  const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${url.host}/cdp?secret=${encodeURIComponent(providedSecret)}`;

  return c.json({
    'Browser': 'Cloudflare-Browser-Rendering/1.0',
    'Protocol-Version': '1.3',
    'User-Agent': 'Mozilla/5.0 Cloudflare Browser Rendering',
    'V8-Version': 'cloudflare',
    'WebKit-Version': 'cloudflare',
    'webSocketDebuggerUrl': wsUrl,
  });
});

/**
 * GET /json/list - List available targets (tabs)
 * 
 * Returns a list of available browser targets for compatibility with tools like Playwright.
 * Note: Since we create targets on-demand per WebSocket connection, this returns
 * a placeholder target that will be created when connecting.
 * Authentication: Pass secret as query param `?secret=<CDP_SECRET>`
 */
cdp.get('/json/list', async (c) => {
  // Verify secret from query param
  const url = new URL(c.req.url);
  const providedSecret = url.searchParams.get('secret');
  const expectedSecret = c.env.CDP_SECRET;

  if (!expectedSecret) {
    return c.json({
      error: 'CDP endpoint not configured',
      hint: 'Set CDP_SECRET via: wrangler secret put CDP_SECRET',
    }, 503);
  }

  if (!providedSecret || !timingSafeEqual(providedSecret, expectedSecret)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!c.env.BROWSER) {
    return c.json({
      error: 'Browser Rendering not configured',
      hint: 'Add browser binding to wrangler.jsonc',
    }, 503);
  }

  // Build the WebSocket URL
  const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${url.host}/cdp?secret=${encodeURIComponent(providedSecret)}`;

  // Return a placeholder target - actual target is created on WS connect
  return c.json([
    {
      'description': '',
      'devtoolsFrontendUrl': '',
      'id': 'cloudflare-browser',
      'title': 'Cloudflare Browser Rendering',
      'type': 'page',
      'url': 'about:blank',
      'webSocketDebuggerUrl': wsUrl,
    },
  ]);
});

/**
 * GET /json - Alias for /json/list (some clients use this)
 */
cdp.get('/json', async (c) => {
  // Verify secret from query param
  const url = new URL(c.req.url);
  const providedSecret = url.searchParams.get('secret');
  const expectedSecret = c.env.CDP_SECRET;

  if (!expectedSecret) {
    return c.json({
      error: 'CDP endpoint not configured',
      hint: 'Set CDP_SECRET via: wrangler secret put CDP_SECRET',
    }, 503);
  }

  if (!providedSecret || !timingSafeEqual(providedSecret, expectedSecret)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!c.env.BROWSER) {
    return c.json({
      error: 'Browser Rendering not configured',
      hint: 'Add browser binding to wrangler.jsonc',
    }, 503);
  }

  // Build the WebSocket URL
  const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${url.host}/cdp?secret=${encodeURIComponent(providedSecret)}`;

  return c.json([
    {
      'description': '',
      'devtoolsFrontendUrl': '',
      'id': 'cloudflare-browser',
      'title': 'Cloudflare Browser Rendering',
      'type': 'page',
      'url': 'about:blank',
      'webSocketDebuggerUrl': wsUrl,
    },
  ]);
});

export { cdp };
