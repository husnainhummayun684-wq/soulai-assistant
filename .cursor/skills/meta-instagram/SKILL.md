---
name: meta-instagram
description: >-
  Manages Instagram and Facebook via Meta Graph API MCP. Single-account by
  default (account_id optional); multi-account when META_ACCOUNTS is set.
  Use on explicit Meta/IG/FB requests or /Meta commands.
---

# Meta / Instagram + Facebook

## Steps

1. If multiple accounts are configured, resolve **account_id** (`meta_list_accounts` if unclear). With a **single** account, omit `account_id` — the server uses it automatically.
2. Load brand ToV from `knowledge/` for captions/replies.
3. Prefer **preview** (`meta_preview_post`) before any live action.
4. Publish / reply / DM only on explicit request; always `confirm=true`.
5. Confirm back with platform + result ids. Audit: `logs/meta-audit.jsonl`.

## Tool map

| Goal | Tools |
|------|--------|
| List accounts | `meta_list_accounts` |
| Preview | `meta_preview_post` |
| IG publish | `ig_create_*` → `ig_publish_container`, or `ig_publish_image|carousel|reel|story` |
| FB publish | `fb_publish_post`, `fb_publish_photo`, `fb_publish_video` |
| Insights | `ig_get_*_insights`, `fb_get_page_insights` |
| Comments / DMs | `ig_*` / `fb_*` comment tools; `meta_*` DM tools |
| Tokens | `meta_debug_account_token`, `meta_refresh_account_token` |

## Config reminder

Default `.env`: `META_PAGE_ACCESS_TOKEN` + `META_PAGE_ID` + `META_IG_BUSINESS_ACCOUNT_ID`.
Multi-account only if `META_ACCOUNTS` / `META_ACCOUNTS_FILE` is set.
