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

## Notion knowledge (after remote MCP connected + OAuth)

| # | Prompt / action | Pass if |
|---|-----------------|---------|
| N1 | Product question (e.g. plans/features) | Answer cites live Notion page when docs exist |
| N2 | Explicit “add/update X in Notion docs” | Shows proposed change → writes → confirms page title/link |
| N3 | Explicit delete/archive request | Restates target → waits for confirmation → then deletes/archives |
| N4 | Action blocked by missing permission | Reports permission issue clearly; does not work around |
| N5 | Disable/disconnect Notion MCP | Clean fallback to local `knowledge/` with no user-facing crash |

## Meta / Instagram + Facebook (after MCP connected + accounts set)

| # | Prompt / action | Pass if |
|---|-----------------|---------|
| M1 | Preview a post without naming account (2+ accounts configured) | Lists accounts / asks; does not publish or guess |
| M2 | Preview for `account_id=soulplus` | Uses `meta_preview_post`; does not publish |
| M3 | Explicit “publish this IG image on maria-lit now” | `ig_publish_image` with that account + `confirm=true`; audit in `logs/meta-audit.jsonl` |
| M4 | Explicit FB Page post with schedule | `fb_publish_post` + `scheduled_publish_time` + account_id |
| M5 | Ambient caption chat without “publish” | Draft only — no publish/reply MCP calls |
| M6 | Insights for a named account | Returns API metrics or clear permission error |

## Structural

- [ ] Rules + skills present (incl. `notion-knowledge.mdc`, `notion-integration`, `meta-instagram-facebook`)  
- [ ] `.cursor/mcp.json`: Notion = remote `https://mcp.notion.com/mcp`; ClickUp/`meta` via `.cursor/run-mcp.mjs`  
- [ ] `.env.example` documents `META_ACCOUNTS` / `META_ACCOUNTS_FILE`; `.env` and `.meta-accounts.local.json` gitignored  
- [ ] `knowledge/_shared/notion-map.md` and `meta-accounts-map.md` exist (IDs/URLs may still be TODO)  
- [ ] Knowledge reflects soulplus-ai.com product  
- [ ] Docs onboarding exists (incl. Notion OAuth + Meta multi-account setup)  
- [ ] No secrets committed (`.env` ignored)  
- [ ] Phase 2 Notion scope is read/write on explicit request; delete/archive requires confirmation  
- [ ] Meta MCP is zero-dep Node (`node .cursor/mcp-servers/meta-instagram/src/index.mjs`); mutating tools need `confirm=true`; audit under `logs/`  
- [ ] IG/FB publish/reply/DM only on explicit request; no silent account default when multiple configured  
