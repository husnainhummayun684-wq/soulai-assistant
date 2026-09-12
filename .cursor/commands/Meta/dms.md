Handle **DMs** (Instagram / Messenger via Page) for a named account.

1. Require **account_id**.
2. `meta_list_conversations` / `meta_get_conversation_messages`.
3. Send only on explicit request: `meta_send_dm` with `confirm=true`.
4. Advanced Access / messaging window rules still apply — surface Meta errors.
5. Never auto-reply from ambient context; never guess the account when multiple exist.
