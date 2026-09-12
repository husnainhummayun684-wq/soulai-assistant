Refresh or inspect Meta **long-lived Page tokens** (~60-day life) per account.

1. `meta_list_accounts` if needed, then `meta_debug_account_token` with `account_id`.
2. Refresh: `meta_refresh_account_token` with `account_id` and `confirm=true`, or exchange a short-lived token via `meta_exchange_long_lived_token`.
3. Paste the new `page_access_token` into that account’s entry in `META_ACCOUNTS` / `META_ACCOUNTS_FILE`.
4. Restart the `meta` MCP server. Never commit tokens.
