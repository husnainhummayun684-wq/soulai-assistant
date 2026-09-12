Handle **comments** on Instagram or Facebook for a named account.

1. Require **account_id** and platform (IG media id vs FB object/post id).
2. Read with `ig_get_comments` or `fb_get_comments`; show the user.
3. Reply/hide/delete only on explicit instruction; mutating tools need `confirm=true`.
4. Match brand ToV for replies. Confirm what changed (audit log includes account + platform).
