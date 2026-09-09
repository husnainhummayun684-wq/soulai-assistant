# Acceptance tests (Phase 1)

| # | Prompt | Pass if |
|---|--------|---------|
| 1 | Instagram caption for SoulPlus AI in our ToV | Destiny Matrix + AI; awareness not fatalism |
| 2 | Reel about relationships / Compatibility Matrix | On-brand; clear CTA |
| 3 | Rewrite caption to sound more like our brand | Closer to approved examples |
| 4 | RU notes → professional EN message for developers | Natural EN; terms preserved |
| 5 | 10 content ideas from SoulPlus positioning | Reflect product pillars |
| 6 | What is SoulPlus AI and how should we communicate it? | Matches knowledge/About philosophy |
| 7 | Rewrite for Maria Lit rather than SoulPlus | Founder voice shift |
| 8 | One-week content plan | Formats/topics fit product |
| 9 | Draft a short welcome email for $0.99 trial | Labeled draft; correct public offer/trust points |

## Notion knowledge (after MCP connected + token set)

| # | Prompt / action | Pass if |
|---|-----------------|---------|
| N1 | Product question (e.g. plans/features) | Answer cites live Notion page when docs exist |
| N2 | Explicit “add/update X in Notion docs” | Shows proposed change → writes → confirms page title/link |
| N3 | Explicit delete/archive request | Restates target → waits for confirmation → then deletes/archives |
| N4 | Action blocked by missing capability | Reports which Notion capability is missing; does not work around |
| N5 | Disable/disconnect Notion MCP | Clean fallback to local `knowledge/` with no user-facing crash |

## Structural

- [ ] Rules + skills present (incl. `notion-knowledge.mdc`, `notion-integration`)  
- [ ] `.cursor/mcp.json` runs Notion/ClickUp via `.cursor/run-mcp.mjs` (loads `.env`; maps `NOTION_API_KEY` → `NOTION_TOKEN`)  
- [ ] `.env.example` documents `NOTION_API_KEY`; `.env` is gitignored  
- [ ] `knowledge/_shared/notion-map.md` exists (URLs may still be TODO)  
- [ ] Knowledge reflects soulplus-ai.com product  
- [ ] Docs onboarding exists (incl. Notion token step)  
- [ ] No secrets committed (`.env` ignored)  
- [ ] Phase 2 Notion scope is read/write on explicit request; delete/archive requires confirmation; permissions from integration Capabilities  
