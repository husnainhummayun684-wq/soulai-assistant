# Knowledge Index

**Notion is the primary source** for product documentation (features, plans, pricing). Use Notion MCP first (rule: `notion-knowledge.mdc`). Files listed below hold **brand, tone, and marketing** material and act as a **fallback** when Notion is unavailable or a page is still unmapped.

See `docs/HOW-TO-UPDATE-KNOWLEDGE.md` for how to update docs.

**Primary product:** [SoulPlus AI](https://www.soulplus-ai.com/) — Destiny Matrix + AI insights.

## How to use (humans)

1. Update **product** docs in Notion; share pages with the company internal integration.
2. Update **brand / ToV / marketing** examples in the local `.md` files below; commit/push.
3. Optionally fill Notion URLs in `notion-map.md`.

## How to use (AI)

1. Follow `.cursor/rules/notion-knowledge.mdc` for product questions (and writes when explicitly asked).  
2. Fall back to paths below if Notion MCP is down or nothing relevant is found.  
3. Prefer specific brand files over assumptions. Do not invent facts.


---

## Shared (`_shared/`) — fallback

| File | Purpose |
|------|---------|
| [notion-map.md](_shared/notion-map.md) | Category → Notion page URLs |
| [company-overview.md](_shared/company-overview.md) | Who we are, philosophy, links |
| [products.md](_shared/products.md) | Product + public plan |
| [team.md](_shared/team.md) | Roles |
| [terminology.md](_shared/terminology.md) | RU/EN terms |

## SoulPlus AI (`soulplus/`) — fallback

| File | Purpose |
|------|---------|
| [brand.md](soulplus/brand.md) | Positioning |
| [product.md](soulplus/product.md) | Features, journey, plan |
| [tone-of-voice.md](soulplus/tone-of-voice.md) | ToV |
| [marketing.md](soulplus/marketing.md) | CTAs, channels |
| [audience.md](soulplus/audience.md) | Audience |
| [content-examples-approved.md](soulplus/content-examples-approved.md) | Like |
| [content-examples-avoid.md](soulplus/content-examples-avoid.md) | Avoid |

## Soul Healing Center (`soul-healing-center/`) — fallback

Center/ecosystem context (product details live under SoulPlus).

## Maria Lit (`maria-lit/`) — fallback

Founder brand, ToV, examples.

## Marketing (`marketing/`) — fallback

Strategy, funnels, audiences, campaigns.

## Future (`_future/`)

Blueprint, Design, Development, Human Architecture, decisions — expand later toward Company Brain.

## Adding a new section

1. Create Notion page + add row to `notion-map.md`  
2. Optionally mirror under `knowledge/<topic>/` as fallback  
3. Index it here  
4. Optional: new Cursor rule/skill if behavior must change  
