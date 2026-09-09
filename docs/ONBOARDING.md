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

1. Create a Notion **internal integration** and copy the token (Settings & members → Connections → Develop or manage integrations).
2. On that integration → **Capabilities**, enable at least: **Read content**, **Update content**, **Insert content** (and user info if you need emails). Capabilities can only be changed in Notion’s UI — not from Cursor or this repo.
3. **Share** company product doc pages (or their parent) with that integration in Notion. Without Share, MCP auth works but search returns no pages.
4. Copy `.env.example` → `.env` and set `NOTION_API_KEY` (and ClickUp keys if using tasks). Never commit `.env`.
5. Repo includes `.cursor/mcp.json` → Notion + ClickUp MCP via `.cursor/run-mcp.mjs` (loads local `.env`; Notion package `@notionhq/notion-mcp-server@latest`).
6. In Cursor: enable the **notion** and **clickup** MCP servers (Settings → MCP → refresh/restart after editing `.env`).
7. Optionally fill page URLs in `knowledge/_shared/notion-map.md` and List IDs in `knowledge/_shared/clickup-map.md`.

Without Notion, the assistant falls back to local `knowledge/` files. Phase 2 allows Notion create/update/delete on **explicit request** only — bounded by the integration’s Capabilities in Notion.

## 5. Secrets

Copy `.env.example` → `.env` and set `NOTION_API_KEY`, `CLICKUP_API_KEY`, and `CLICKUP_TEAM_ID`. Never commit `.env`.

## 6. Start using the AI

Mention **SoulPlus AI** (or Maria Lit) and optionally a mode:

- `/content` — SMM, captions, Reels, plans  
- `/marketing` — campaigns, funnels, **email drafts** (not sending)  
- `/founder` — RU notes → EN team briefs  
- `/general` — product/brand questions  

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
