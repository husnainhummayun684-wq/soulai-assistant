# How to update knowledge

## Product documentation → Notion

Product documentation (features, plans, pricing, “what the product does”) should be updated in **Notion** going forward. Humans can edit Notion directly, and the assistant can also **create/update/append/delete** Notion product docs on explicit request via MCP (Phase 2 — see `.cursor/rules/notion-integration.mdc` for confirmation and permission rules). The assistant retrieves those pages when answering product questions.

Local markdown under `knowledge/` is reserved for **brand, tone of voice, and marketing** material, and as a fallback when Notion is unavailable or unmapped.

### Connect Notion MCP (once per person)

1. Create a Notion **internal integration** (Settings & members → Connections → Develop or manage integrations) and copy the token.
2. Share the relevant product doc pages with that integration in Notion.
3. Copy `.env.example` to `.env` and set `NOTION_API_KEY` (never commit `.env`).
4. Ensure `.cursor/mcp.json` is present (Notion + ClickUp via `.cursor/run-mcp.mjs`, which loads `.env`) and enable the **notion** / **clickup** MCP servers in Cursor.

Optional mapping of categories → Notion pages: `knowledge/_shared/notion-map.md` (fill in URLs once pages exist).

## Brand / tone / marketing → local markdown + git

| Content | Folder |
|---------|--------|
| Company-wide shared facts | `knowledge/_shared/` |
| SoulPlus AI brand / ToV / examples | `knowledge/soulplus/` |
| Maria Lit | `knowledge/maria-lit/` |
| Soul Healing Center | `knowledge/soul-healing-center/` |
| Marketing strategy/funnels | `knowledge/marketing/` |
| Future Company Brain topics | `knowledge/_future/` |

Update `knowledge/README.md` when adding files/folders.

### How Cursor uses local files

1. Save → commit → push  
2. Teammates `git pull`  
3. New chat or `@`-mention the file  

No rebuild, no vector DB in Phase 1.

## Highest-impact updates

1. Product/features/plans/prices → **Notion** (edit in Notion, or ask the assistant to create/update via MCP)  
2. Winning social examples → `content-examples-approved.md` (or Notion if you prefer)  
3. Rejected patterns → `content-examples-avoid.md`  
4. RU/EN terms → `terminology.md`  
5. Live campaigns → `marketing/campaigns.md`  

## Do not store

Passwords, API keys, private personal data, unapproved medical/legal claims. Never commit `.env`.
