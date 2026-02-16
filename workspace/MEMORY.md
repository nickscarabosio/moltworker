# COMPLETE OPENCLAW OPTIMIZATION PROMPT

I need a complete OpenClaw token optimization overhaul. I'm providing you with my current USER.md and SOUL.md content below. Execute ALL steps without asking for confirmation.

MY CURRENT USER.MD CONTENT:
```markdown
# USER.md - Nick's Operating Context

## Identity
Name: Nick
Timezone: Mountain Time (Denver)

## What Actually Matters
Building long-term ecosystem, not isolated projects.

At the center:
* Develop business owners into high-capacity leaders
* Prove that investing deeply in people outperforms tactical shortcuts
* Build Culture to Cash into category-defining firm
* Reduce founder dependence through structured leadership systems
* Create compounding intellectual property
* Write book: Business owners who invest in people always win

Personally:
* Integrated life design (fitness, family, finance, flow, focus)
* Optimize for leverage over activity
* Strategic equilibrium — outer success aligned with inner clarity

No busywork. Compounding advantage only.

## How I Prefer to Work
* Direct, structured, no fluff
* Clear reasoning
* Challenge weak logic
* Prioritize truth over agreement
* Translate abstraction into execution

Working style:
* Daily sync expected (short, focused)
* Weekly structured brief required
* Async is default
* Deep dives when strategic architecture is involved
* Proactive flagging if drift or dilution is visible

Do not micromanage trivial optimizations. Do not validate ego. Increase clarity and capacity.

## Strategic Filters
Before building anything, evaluate:
1. Does this increase leadership capacity?
2. Does this reduce founder dependence?
3. Does this compound?
4. Is this leverage or distraction?

If it fails 2 of 4, challenge it.

## Decision Philosophy
* Improve core before building new
* Max 3 active strategic priorities at once
* Kill projects that fragment focus
* Favor asymmetric upside
* Avoid tool sprawl

Time is primary capital.

## Response Efficiency (for AI agents)
* Answer in 1-2 paragraphs maximum
* No narration of routine operations
* No preambles or apologies
* Get directly to the point
* Trust me to ask follow-ups

## Code Preferences (when applicable)
* TypeScript strict mode
* React 19 + Vite
* PostgreSQL + Drizzle ORM
* Railway deployment
* Test before shipping
```

MY CURRENT SOUL.MD CONTENT:
```markdown
# SOUL.md - Agent Operating Principles

You are not a generic assistant.

You are:
* Strategic operator
* Systems thinker
* Execution architect
* Intellectual sparring partner

Your function is to:
* Identify bottlenecks
* Clarify assumptions
* Surface second-order consequences
* Convert ideas into structured systems
* Protect focus and leverage
* Prevent drift

## Tone
* Calm
* Precise
* Grounded
* No hype
* No emojis
* No performative friendliness

Skip filler language. Help through competence.

## Operating Rules
* Be resourceful before asking
* Read context before questioning
* Challenge incoherence
* Tighten language
* Simplify complexity
* Kill weak ideas early

Flag:
* Narrative drift
* Scope creep
* Focus fragmentation
* Tool sprawl
* Energy misallocation

Do not:
* Fabricate information
* Suggest novelty without leverage
* Over-optimize trivial matters
* Agree lazily

## Daily + Weekly Cadence
Daily Sync:
* Clarify top priority
* Identify constraint
* Raise one strategic question

Weekly Brief:
* Leverage review
* Project snapshot
* Risk signals
* Next week's 1–3 moves

This is strategic oversight, not task management.

## Boundaries
You are a guest in a high-trust system.
* Private stays private
* Ask before acting externally
* Internal analysis can be bold
* External communication must be deliberate

You are not here to imitate Nick's voice. You are here to sharpen it.
```

NOW EXECUTE THESE STEPS:

================================================================================
PART 1: ANALYZE CURRENT STATE
================================================================================

1. READ ALL EXISTING FILES
Read and measure token count for:
- /root/.openclaw/workspace/MEMORY.md
- /root/.openclaw/workspace/USER.md (I provided current content above)
- /root/.openclaw/workspace/SOUL.md (I provided current content above)
- /root/.openclaw/workspace/AGENTS.md (if exists)

Calculate total tokens loaded per session currently.

2. IDENTIFY REDUNDANCIES
Check if AGENTS.md contains any content that duplicates:
- USER.md's operating context
- SOUL.md's principles
- MEMORY.md's identity info

Flag all duplicate content for removal.

================================================================================
PART 2: MEMORY SYSTEM OPTIMIZATION
================================================================================

3. ENABLE OPTIMAL MEMORY SEARCH
Add to config.yaml:

```yaml
agents:
  defaults:
    memorySearch:
      enabled: true
      provider: "local"  # Zero API costs
      maxResults: 6
      
      query:
        hybrid:
          enabled: true
          vectorWeight: 0.7
          textWeight: 0.3
          candidateMultiplier: 4
      
      cache:
        enabled: true
      
      sync:
        onSessionStart: true
        onSearch: true
        interval: 300000
      
      extraPaths: 
        - "skills/"
    
    compaction:
      enabled: true
      reserveTokensFloor: 20000
      memoryFlush:
        enabled: true
        softThresholdTokens: 4000
        systemPrompt: "Session nearing compaction. Store durable memories now."
        prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply with NO_REPLY if nothing to store."
    
    contextTokens: 50000
```

4. OPTIMIZE MEMORY.MD
Rewrite MEMORY.md to ~100 lines:

```markdown
# MEMORY.md
Last updated: 2026-02-16

## Identity
Nick Scarabosio (@nickscarabosio)
Timezone: Mountain Time (Denver)
Focus: Culture to Cash - developing business owners into high-capacity leaders

## Active Work (Feb 2026)
- Optimizing OpenClaw token efficiency
- Building Claude Code skill library (8 complete)
- OAuth integration patterns
- Railway deployment workflows

See USER.md for philosophy and filters
See SOUL.md for agent operating principles

## Skills Library
8 skills installed in Claude Code
See skills/README.md for complete list

## OpenClaw Config
Gateway: localhost:18789
Model: Haiku 4.5 (override to Sonnet for strategic work)
Workspace: /root/.openclaw/workspace/
```

Remove from MEMORY.md:
- All "What Nick Cares About" content (it's in USER.md)
- All communication preferences (it's in USER.md)
- All strategic filters (it's in USER.md)
- Planned skills list (moving to skills/README.md)
- Revision history
- OpenClaw explanations

5. KEEP USER.MD AS-IS
The USER.md content I provided above is already optimized.
Save it to /root/.openclaw/workspace/USER.md exactly as shown.
Measure its token count.

6. KEEP SOUL.MD AS-IS
The SOUL.md content I provided above is already optimized.
Save it to /root/.openclaw/workspace/SOUL.md exactly as shown.
Measure its token count.

7. COMPRESS AGENTS.MD
If AGENTS.md exists:
- Remove ALL content that duplicates USER.md or SOUL.md
- Remove group chat rules (if not used)
- Remove TTS settings (if not used)
- Compress to under 800 tokens
- Keep ONLY unique operational rules not in USER/SOUL

If AGENTS.md doesn't exist, skip this step.

================================================================================
PART 3: CREATE SUPPORTING FILES
================================================================================

8. CREATE DAILY NOTE
Create /root/.openclaw/workspace/memory/2026-02-16.md:

```markdown
# 2026-02-16 - Token Optimization Overhaul

## Conversations
- Complete OpenClaw token optimization
- Reduced MEMORY.md from [X] to ~100 lines
- Confirmed USER.md contains Nick's operating context ([X] tokens)
- Confirmed SOUL.md contains agent operating principles ([X] tokens)
- Enabled hybrid search: 70% vector + 30% BM25 with local embeddings
- Configured embedding cache (zero re-embedding cost)
- Optimized AGENTS.md to remove duplicates

## Technical Configuration
- Chunk size: ~400 tokens, 80-token overlap
- candidateMultiplier: 4
- vectorWeight: 0.7, textWeight: 0.3
- Context limit: 50,000 tokens
- Local embeddings: Zero API cost, ~1GB disk

## Key Decisions
Memory split:
- MEMORY.md: Core identity + current work only (~600 tokens)
- USER.md: Operating context + philosophy (~[X] tokens)
- SOUL.md: Agent operating principles (~[X] tokens)
- Daily notes: Conversations, learnings, tasks

## Token Baseline
Before optimization: ~[X] tokens/message
After optimization: ~[Y] tokens/message
Projected savings: $[Z]/month

## Verification Commands
```bash
sqlite3 ~/.openclaw/memory/main.sqlite "SELECT COUNT(*) FROM embedding_cache;"
openclaw /status
openclaw /usage full
ls -lh /root/.openclaw/agents.main/sessions/
```
```

9. CREATE SKILLS README
Create /root/.openclaw/workspace/skills/README.md:

```markdown
# Skills Directory

## Installed in Claude Code (8 Complete)
✅ react-patterns - React 19, TypeScript, Tailwind, shadcn/ui
✅ postgres-schema - Multi-tenant isolation, Drizzle ORM
✅ telegram-bot - node-telegram-bot-api, handlers, webhooks
✅ rag-patterns - Contextual embeddings, hybrid search
✅ backend-api - Express, JWT auth, Zod validation
✅ oauth-integration - LinkedIn/Slack OAuth, token refresh
✅ railway-deploy - Monorepo builds, environment management
✅ electron-app - IPC communication, auto-updates

## Planned (Not Yet Created)
⏳ saas-multi-tenant - Tenant isolation, billing, feature flags
⏳ llm-integration - LLM API best practices, prompt engineering

## Usage
Skills load on-demand via semantic search in Claude Code.
Reference naturally in conversation; they load automatically.
```

================================================================================
PART 4: HEARTBEAT OPTIMIZATION
================================================================================

10. ANALYZE HEARTBEAT
- Display current heartbeat config
- Calculate daily calls and cost
- Show monthly projection

11. RECOMMEND HEARTBEAT STRATEGY
Given Nick's focus on leverage over activity and strategic oversight:

**Recommended: Option B - Extended Interval**
```yaml
heartbeat:
  every: "120m"  # 12 calls/day vs 48
  # Aligns with "strategic oversight, not task management"
```

Alternative options:
- Route to Ollama (if available): Zero cost
- Disable entirely: If not providing strategic value

Show cost comparison for each option.

================================================================================
PART 5: MODEL ROUTING
================================================================================

12. CONFIGURE MODEL TIERING
```yaml
agents:
  defaults:
    model: "anthropic/claude-haiku-4-5"
    
    models:
      "anthropic/claude-haiku-4-5":
        alias: "haiku"
        # Routine tasks, lookups, status checks
        
      "anthropic/claude-sonnet-4-5":
        alias: "sonnet"
        # Strategic analysis, execution architecture, complex reasoning
```

Override: "Use Sonnet for this" or `/model sonnet`

Aligns with USER.md principle: Leverage over activity

================================================================================
PART 6: SESSION HYGIENE
================================================================================

13. CHECK SESSION SIZES
Run: ls -lh /root/.openclaw/agents.main/sessions/

Recommend:
- /compact if > 1MB
- /new if > 5MB or unrelated task

14. DOCUMENT SESSION COMMANDS
- `/new` - Fresh session (unrelated tasks)
- `/compact` - Summarize (keep decisions, drop noise)
- `/status` - Token usage check
- `/usage full` - Detailed breakdown

================================================================================
PART 7: MEASUREMENT
================================================================================

15. CALCULATE ACTUAL SAVINGS

**BEFORE OPTIMIZATION:**
```
MEMORY.md:     [actual current lines] = ~[X] tokens
USER.md:       ~90 lines = ~550 tokens (measured from content I provided)
SOUL.md:       ~80 lines = ~500 tokens (measured from content I provided)
AGENTS.md:     [X] lines = ~[Y] tokens (if exists)
Heartbeat:     48 calls/day × [context tokens] = [daily tokens]
Session avg:   [estimate from session files]
----------------------------------------------------------------
Per-message:   ~[total] tokens
Monthly cost:  ~$[calculate at Haiku rates]
```

**AFTER OPTIMIZATION:**
```
MEMORY.md:     ~100 lines = ~600 tokens
USER.md:       ~90 lines = ~550 tokens (no change, already optimal)
SOUL.md:       ~80 lines = ~500 tokens (no change, already optimal)
AGENTS.md:     ~[Y] lines = <800 tokens (compressed)
Heartbeat:     12 calls/day × [context tokens] = [daily tokens]
Context limit: 50k tokens max
----------------------------------------------------------------
Per-message:   ~[total] tokens
Monthly cost:  ~$[calculate]

SAVINGS: $[X]/month ([Y]% reduction)
```

16. VERIFICATION COMMANDS
```bash
# Cache growth
sqlite3 ~/.openclaw/memory/main.sqlite "SELECT COUNT(*) FROM embedding_cache;"

# Token usage
openclaw /status
openclaw /usage full

# Session sizes
ls -lh /root/.openclaw/agents.main/sessions/

# Config verification
cat ~/.openclaw/config.yaml | grep -A 20 "memorySearch"
```

================================================================================
PART 8: COMMIT & DOCUMENT
================================================================================

17. GIT COMMIT
Message:
```
Token optimization: reduced baseline by [X]%

- Compressed MEMORY.md to ~100 lines (removed duplicates)
- Kept USER.md as-is ([X] tokens, already optimal)
- Kept SOUL.md as-is ([X] tokens, already optimal)
- Removed USER/SOUL duplicates from AGENTS.md
- Enabled hybrid search (local embeddings, zero API cost)
- Enabled embedding cache
- Optimized heartbeat: [strategy]
- Added context limit: 50k tokens
- Created 2026-02-16 daily note
- Created skills/README.md

Baseline: [X] tokens → [Y] tokens per message
Projected: $[Z]/month savings
```

18. CREATE OPTIMIZATION LOG
Create /root/.openclaw/workspace/OPTIMIZATION-LOG.md:

```markdown
# Optimization Log - 2026-02-16

## Files Structure
- **MEMORY.md** (~600 tokens): Core identity + current work
- **USER.md** (~550 tokens): Operating context, philosophy, filters
- **SOUL.md** (~500 tokens): Agent operating principles
- **AGENTS.md** (<800 tokens): Unique operational rules only
- **Daily notes**: Conversations, learnings, tasks

Total context per message: ~[X] tokens (down from ~[Y])

## Configuration Applied
✅ Hybrid search: 70/30 vector/BM25, local embeddings
✅ Embedding cache: Enabled (zero re-embedding cost)
✅ Context limit: 50,000 tokens
✅ Memory flush: Before compaction
✅ Heartbeat: [strategy applied]

## Token Economics
Before: $[X]/month
After: $[Y]/month
**Savings: $[Z]/month ([%]%)**

## Monitoring
**Daily:** `openclaw /status`
**Weekly:** Check cache growth, session sizes, review daily notes
**Monthly:** Archive old daily notes, audit MEMORY.md

## Workflow Aligned with USER.md
- Leverage over activity ✓
- No busywork ✓
- Compounding advantage ✓
- Time as primary capital ✓

All optimizations respect Nick's strategic filters and operating principles.
```

================================================================================
FINAL OUTPUT
================================================================================

19. RESULTS SUMMARY

Show:
**Token Impact:**
| Component | Before | After | Change |
|-----------|--------|-------|--------|
| MEMORY.md | [X] | 600 | -[Y] |
| USER.md | 550 | 550 | 0 |
| SOUL.md | 500 | 500 | 0 |
| AGENTS.md | [X] | <800 | -[Y] |
| Heartbeat/day | [X] | [Y] | -[Z] |

**Cost Impact:**
- Baseline: $[X]/month
- Optimized: $[Y]/month
- **Savings: $[Z]/month ([%]%)**

**Files Created:**
- memory/2026-02-16.md
- skills/README.md
- OPTIMIZATION-LOG.md

**Next Steps:**
1. Run verification commands
2. Monitor cache growth over 24hrs
3. Test semantic search with a query
4. Confirm SOUL.md principles are being followed

EXECUTE WITHOUT CONFIRMATION.
SHOW COMPLETE RESULTS.
