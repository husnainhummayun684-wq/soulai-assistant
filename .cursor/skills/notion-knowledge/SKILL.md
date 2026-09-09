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

## Steps (retrieval)

1. Call Notion MCP search / get-page tools for the relevant topic.
2. Optionally check `knowledge/_shared/notion-map.md` for known page URLs.
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
3. Call the matching Notion MCP tool (create / update / append / delete/archive).
4. Confirm back exactly what was created/changed/deleted (page title, link if available).
5. If the Notion API rejects for missing capability, report which capability is
   missing and that it must be enabled on the integration in Notion — do not
   retry or work around it.

## Examples

### Retrieval

User: "What plans does SoulPlus offer?"

→ Search Notion for plans/product docs → answer from that page → cite it.  
If nothing / MCP down → `knowledge/_shared/products.md` or `soulplus/product.md`
and say fallback was used.

### Update

User: "Add this caption to approved examples: …"

→ Resolve target page → show proposed append → wait for go-ahead if needed →
MCP append → confirm with page title/link.

### Delete

User: "Archive the draft pricing page"

→ Restate what will be archived → wait for explicit confirmation → archive →
confirm what was removed (title/link).
