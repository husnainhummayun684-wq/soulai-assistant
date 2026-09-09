# ClickUp list map

Maps work areas to ClickUp Spaces / Folders / Lists. **Fill in the List IDs** after the workspace is connected (`CLICKUP_API_KEY` + `CLICKUP_TEAM_ID` in local `.env`).

Until a cell is filled, the assistant asks which List to use or looks up Lists via MCP.

| Area | Space / Folder (notes) | List name | List ID |
|---|---|---|---|
| Content / SMM | `<!-- TODO: Space/Folder -->` | Content | `<!-- TODO: paste List ID -->` |
| Marketing | `<!-- TODO: Space/Folder -->` | Marketing | `<!-- TODO: paste List ID -->` |
| Product | `<!-- TODO: Space/Folder -->` | Product | `<!-- TODO: paste List ID -->` |
| Founder / Ops | `<!-- TODO: Space/Folder -->` | Ops | `<!-- TODO: paste List ID -->` |
| General / Shared | `<!-- TODO: Space/Folder -->` | Shared | `<!-- TODO: paste List ID -->` |

## How to get a List ID

In ClickUp: open the List → copy the URL. The List ID is the numeric segment after `/li/` (or visible in List settings). Paste it into the table above.

## Statuses

Statuses are configured per List/Space — do not assume a fixed set. Fetch the List’s statuses via MCP before changing status.
