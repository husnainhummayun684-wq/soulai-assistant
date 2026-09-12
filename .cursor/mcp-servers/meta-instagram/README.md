# Meta MCP (Instagram + Facebook)

Pure **Node.js** MCP server — **no npm install**, no SDK packages.

## Run

```bash
node .cursor/mcp-servers/meta-instagram/src/index.mjs
```

Cursor launches the same entry via `.cursor/mcp.json` (`meta` server). The process loads workspace `.env` on startup.

Requires **Node.js 18+** (built-in `fetch`).

## Layout

```
src/
  index.mjs      entry
  env.mjs        load workspace .env
  mcp-stdio.mjs  MCP JSON-RPC over stdio
  tools.mjs      Graph API tools
  accounts.mjs   single / multi-account config
  graph.mjs      Meta Graph client
  audit.mjs      logs/meta-audit.jsonl
```

## Config

Single account (default) in `.env`:

- `META_APP_ID`, `META_APP_SECRET`
- `META_PAGE_ACCESS_TOKEN`, `META_PAGE_ID`, `META_IG_BUSINESS_ACCOUNT_ID`

See `.env.example` and `.cursor/rules/meta-instagram-facebook.mdc`.
