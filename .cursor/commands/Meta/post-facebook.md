Publish a **Facebook Page** text/link post.

1. Explicit publish (or schedule). **account_id** only required when multiple accounts are configured.
2. Message (+ optional link). Optional `scheduled_publish_time` (Unix seconds).
3. Preview with `meta_preview_post` (platform facebook, media_type FEED).
4. `fb_publish_post` with `confirm=true`.
5. Confirm post id.
