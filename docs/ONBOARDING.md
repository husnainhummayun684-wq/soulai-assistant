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

## 4. Secrets (usually optional)

Phase 1 needs no API keys for daily chat. If later tools need keys: copy `.env.example` → `.env` locally; never commit `.env`.

## 5. Start using the AI

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

## 6. Stay synced

```bash
git pull
```
