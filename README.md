# SoulPlus AI — Internal Assistant (Phase 1)

Shared Cursor workspace for the **SoulPlus AI** team ([soulplus-ai.com](https://www.soulplus-ai.com/)) — Destiny Matrix + AI product.

Helps the team with content, brand communication, marketing drafts (including email **copy**), translations, rewrites, and product knowledge. This is a **company knowledge workspace for Cursor**, not a deployed app and not an email/social autopilot.

## Product in one line

SoulPlus AI unlocks your soul’s matrix: a personalized energy map from ancient numerology (Destiny Matrix), deepened by AI — awareness and conscious choice, not fixed fate.

## What Phase 1 includes

- Structured knowledge from the live product/brand (SoulPlus AI, Maria Lit, marketing, shared)
- Notion-based product doc retrieval via MCP (alongside local `knowledge/` files) — extended by Phase 2 read/write
- ClickUp task management via MCP (create/assign/prioritize/status) on explicit request
- Modes: Content/SMM, Marketing, Founder/Communication, General Company, Task Management
- Russian ↔ English with brand terminology
- Team onboarding + simple knowledge updates
- Room to grow toward email tooling, Company Brain, etc. **later**

## Phase 2

- Full Notion read/write (create, update, append, delete pages/blocks) via MCP, on explicit request, permission-bounded by the integration token’s capabilities configured in Notion

## What Phase 1 does **not** include

Automatic posting, sending email campaigns, autonomous/scheduled ClickUp automation (webhooks, triggers), Supabase RAG, autonomous agents, Stripe admin, website deploy.

Marketing mode **writes** campaign/email drafts; humans send them.

## Quick start

1. Install [Cursor](https://cursor.com) (personal account)
2. Clone the **company** GitHub repo
3. Open this folder in Cursor
4. Chat — mention brand/mode (`/content`, `/marketing`, `/founder`, `/general`)

Full guide: [docs/ONBOARDING.md](docs/ONBOARDING.md)

## Repo map

```
knowledge/          Brand & product truth (edit to teach the AI)
.cursor/rules/      Shared behavior
.cursor/skills/     Mode playbooks
docs/               Onboarding, updates, handover, architecture
AGENTS.md           Root AI instructions
```

## Improve accuracy

Paste winning captions into `knowledge/soulplus/content-examples-approved.md`, log rejected patterns in `content-examples-avoid.md`, and keep Rates/plan facts current in `product.md`.

## Security

Company-owned GitHub; each person uses their own Cursor login; secrets only in local `.env` (see `.env.example`). Notion access uses a company-owned **internal integration** token stored in each user’s local `.env` as `NOTION_API_KEY` — never commit `.env`.

## Future

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Handover: [docs/HANDOVER.md](docs/HANDOVER.md).
