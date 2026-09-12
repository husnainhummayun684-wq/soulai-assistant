# Architecture (Phase 1 → future)

## Phase 1 (now)

```
Company GitHub
└── Cursor (each teammate)
    ├── AGENTS.md + .cursor/rules
    ├── .cursor/skills (modes)
    └── knowledge/*.md  ← SoulPlus AI truth
```

Drafts for social, marketing, and email. No send/post automation.

## Phase 2 (in progress)

```
Cursor → Notion MCP (remote OAuth) + ClickUp MCP + Meta MCP (IG + FB, multi-account)
              ↓
     Explicit human-triggered actions only
```

Notion uses Notion’s hosted MCP (`https://mcp.notion.com/mcp`). ClickUp and Meta still run as local MCP processes via `.cursor/run-mcp.mjs`.

Instagram + Facebook Page publish/comments/DMs via Graph API (`account_id` when multi-account); audit log locally. No autonomous social bots.

## Future (not built)

```
Cursor → Company Brain → Supabase
              ↓
     Team AI / optional RAG
              ↓
 Social · Email ESP · ClickUp · GitHub · Website
```

Keep brand folders stable so later systems can ingest the same markdown.

## Out of Phase 1 / not autonomous

Auto Meta/IG/FB without an explicit ask + account target, email sending, ClickUp automation, Supabase Company Brain, autonomous agents, website deploy, Stripe ops.
