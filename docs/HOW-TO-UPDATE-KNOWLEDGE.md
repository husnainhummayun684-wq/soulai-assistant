# How to update knowledge

## Where to add a document

| Content | Folder |
|---------|--------|
| Company-wide | `knowledge/_shared/` |
| SoulPlus AI product/brand | `knowledge/soulplus/` |
| Maria Lit | `knowledge/maria-lit/` |
| Soul Healing Center | `knowledge/soul-healing-center/` |
| Marketing strategy/funnels | `knowledge/marketing/` |
| Future Company Brain topics | `knowledge/_future/` |

Update `knowledge/README.md` when adding files/folders.

## How Cursor uses it

1. Save → commit → push  
2. Teammates `git pull`  
3. New chat or `@`-mention the file  

No rebuild, no vector DB in Phase 1.

## Highest-impact updates

1. Winning social examples → `content-examples-approved.md`  
2. Rejected patterns → `content-examples-avoid.md`  
3. Plan/price changes → `product.md` + `_shared/products.md` (re-check Rates)  
4. RU/EN terms → `terminology.md`  
5. Live campaigns → `marketing/campaigns.md`  

## Do not store

Passwords, API keys, private personal data, unapproved medical/legal claims.
