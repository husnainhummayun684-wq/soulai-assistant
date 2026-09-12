---
name: notion-knowledge
description: >-
  Retrieves product documentation from Notion via MCP, and handles explicit
  create/update/delete requests following confirmation rules in
  notion-integration.mdc. Use for product facts or when asked to change Notion
  docs. Fall back to local knowledge/ if Notion has nothing or MCP is unavailable.
---

# Notion knowledge

## When to use

- Product/features/plans/pricing documentation questions
- “What does the doc say about X”
- `/general` product Q&A when live Notion docs matter
- Explicit requests to create, update, append, or delete/archive Notion pages/blocks

Do **not** use this skill to invent facts, auto-post social, send email, or
mutate Notion as a side effect of an unrelated ask.

## MCP server

Project Notion MCP is the **official remote Notion MCP** (`https://mcp.notion.com/mcp`
in `.cursor/mcp.json`). Auth is **OAuth** (each teammate connects once in Cursor).
Permissions follow what that Notion user can access — not a shared integration token.

Prefer the project `notion` server when both a Cursor built-in Notion connection and
the project server are present (same backend; avoid duplicate calls).

## Tool map (remote Notion MCP)

| Intent | Tools |
|--------|--------|
| Search | `notion-ai-search` when available; else `notion-search` |
| Read page / DB | `notion-fetch` (URL or ID); optional `notion-map.md` for known URLs |
| Create page(s) | `notion-create-pages` |
| Update page | `notion-update-page` |
| Move / duplicate | `notion-move-pages`, `notion-duplicate-page` |
| Comments | `notion-get-comments`, `notion-create-comment` |
| Databases | `notion-create-database`, `notion-query-data-sources`, `notion-update-data-source`, views via `notion-create-view` / `notion-update-view` |
| Users / teams | `notion-get-users`, `notion-get-teams` |
| Attachments | `notion-create-file-upload`, `notion-create-attachment`, `notion-download-attachment` |

Do not invent tools. Discover schemas with MCP tool descriptors before calling.
Skip Custom Agent / session tools unless the user explicitly asks for Notion agents.

## Steps (retrieval)

1. Optionally check `knowledge/_shared/notion-map.md` for a known page URL/ID.
2. Search with `notion-ai-search` or `notion-search`; fetch hits with `notion-fetch`.
3. Answer from the live page content. Cite page title (and link if available).
4. Prefer Notion over stale markdown when they conflict; note the conflict.
5. If MCP is unavailable or nothing relevant is found, read the local
   `knowledge/` fallback and say so.
6. If both are missing, say it is not documented yet — do not invent prices,
   features, or biography.

## Steps (create / update / delete)

1. Confirm the user explicitly asked to change Notion in this message.
2. Follow confirmation and safety rules in `.cursor/rules/notion-integration.mdc`
   (show proposed change; for delete/archive, restate target and wait for explicit yes).
3. Call the matching tool (`notion-create-pages`, `notion-update-page`, etc.).
4. Confirm back exactly what was created/changed/deleted (page title, link if available).
5. If Notion rejects for missing permission, say so clearly — do not retry or work around it.

## Examples

### Retrieval

User: "What plans does SoulPlus offer?"

→ Search Notion → `notion-fetch` the plans/product page → answer and cite.  
If nothing / MCP down → `knowledge/_shared/products.md` or `soulplus/product.md`
and say fallback was used.

### Update

User: "Add this caption to approved examples: …"

→ Resolve target page → show proposed change → wait for go-ahead if needed →
`notion-update-page` → confirm with page title/link.

### Delete

User: "Archive the draft pricing page"

→ Restate what will be archived → wait for explicit confirmation → archive via
`notion-update-page` (or equivalent) → confirm what was removed (title/link).
