# Team onboarding

Each person uses **their own Cursor account**. Everyone works from the **same repository**.

## 1. Install Cursor

1. Download from [https://cursor.com](https://cursor.com)
2. Sign in with your individual work account
3. Do **not** share one personal Cursor login

## 2. Get repository access

1. Admin invites you to the GitHub org + this repo
2. Accept the invite
3. Confirm you can open the repo in the browser

## 3. Clone and open

```bash
git clone <REPO_URL>
cd soulai-assistant
```

Cursor: **File → Open Folder** → this project.

## 4. Connect Notion MCP (required for live product docs)

Project Notion uses Notion’s **official remote MCP** (same as Cursor’s built-in Notion):
`https://mcp.notion.com/mcp` — configured in `.cursor/mcp.json`. Auth is **OAuth** (no API key).

1. Ensure you can open the company Notion workspace and the product doc roots listed in `knowledge/_shared/notion-map.md`.
2. In Cursor: **Settings → MCP** → enable **notion** → complete the **OAuth** flow when prompted (authorize the workspace).
3. Copy `.env.example` → `.env` for ClickUp / Meta keys if you use those integrations (Notion does not need a key). Never commit `.env`.
4. ClickUp + Meta still run via `.cursor/run-mcp.mjs` (loads local `.env`). Enable **clickup** and **meta** and refresh/restart after editing `.env`.
5. Optionally fill page URLs in `knowledge/_shared/notion-map.md`, List IDs in `knowledge/_shared/clickup-map.md`, and account notes in `knowledge/_shared/meta-accounts-map.md`.

Without Notion, the assistant falls back to local `knowledge/` files. Phase 2 allows Notion create/update/delete on **explicit request** only — bounded by what your OAuth-connected Notion user can access.

## 4b. Connect Meta / Instagram + Facebook MCP (optional)

Local MCP under `.cursor/mcp-servers/meta-instagram` (server id `meta`): pure Node.js project (no npm packages), Instagram + Facebook, `confirm=true` on mutations, audit to `logs/meta-audit.jsonl`.

**Default = one account** (simplest):

1. Facebook **Page** + optional linked IG Business/Creator.
2. Meta app + permissions (see list in `.env.example` / rule file).
3. Graph API Explorer → User token → `GET /me/accounts?fields=id,name,access_token,instagram_business_account`.
4. Exchange for a long-lived Page token (~60 days).
5. In `.env` set:
   - `META_APP_ID`, `META_APP_SECRET`
   - `META_PAGE_ACCESS_TOKEN`
   - `META_PAGE_ID`
   - `META_IG_BUSINESS_ACCOUNT_ID` (if using Instagram)
   - optional `META_ACCOUNT_ID` (slug; defaults to `default`)
6. Enable **meta** in Cursor MCP (runs `node …/meta-instagram/src/index.mjs` — no npm install). Restart after `.env` changes.
7. With a single account you can omit `account_id` on tools.

**Optional multi-account:** set `META_ACCOUNTS` or `META_ACCOUNTS_FILE` (overrides the single-account vars). Then pass `account_id` on every action. See `.env.example`.

**Token refresh:** ~60 days — `/Meta/refresh-token` or `meta_refresh_account_token`, update `.env`, restart MCP. Rule: `.cursor/rules/meta-instagram-facebook.mdc`.

**Safety:** no auto-publish/reply; explicit user request only. IG organic has no native schedule; FB can use `scheduled_publish_time`.

## 5. Secrets

Copy `.env.example` → `.env` and set `CLICKUP_API_KEY`, `CLICKUP_TEAM_ID`, and Meta single-account vars if using social. Notion uses Cursor OAuth (no key in `.env`). Never commit `.env` or `.meta-accounts.local.json`.

## 6. Start using the AI

Mention **SoulPlus AI** (or Maria Lit) and optionally a mode:

- `/content` — SMM, captions, Reels, plans  
- `/marketing` — campaigns, funnels, **email drafts** (not sending)  
- `/founder` — RU notes → EN team briefs  
- `/general` — product/brand questions  
- Meta commands under `.cursor/commands/Meta/` — preview/publish/insights/comments/DMs (explicit only) 

### Example prompts

- Create an Instagram caption for SoulPlus AI in our Tone of Voice.  
- Create a Reel script about Destiny Matrix and relationships.  
- Draft a 3-email welcome sequence for the $0.99 trial (draft only).  
- What is SoulPlus AI and how should we communicate it?  
- Rewrite this for Maria Lit rather than SoulPlus AI.  

## 7. Stay synced

```bash
git pull
```
