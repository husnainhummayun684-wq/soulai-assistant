import {
  getAppCredentials,
  listAccountsPublic,
  requireIg,
  requirePage,
  resolveAccount,
} from "./accounts.mjs";
import { auditLog } from "./audit.mjs";
import { debugToken, graphRequest, oauthRequest, waitForContainer } from "./graph.mjs";

const accountIdProp = {
  type: "string",
  description:
    "Account id. Optional with a single configured account; required when multiple exist (meta_list_accounts).",
};

function textResult(data) {
  return {
    content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }],
  };
}

function errResult(err) {
  return {
    content: [{ type: "text", text: `Error: ${err.message}` }],
    isError: true,
  };
}

function requireConfirm(confirm, action) {
  if (confirm !== true) {
    throw new Error(
      `Refusing ${action}: pass confirm=true only after the user explicitly asked to perform this action.`,
    );
  }
}

function pickAccount(accountId) {
  return resolveAccount(accountId);
}

async function audited(action, details, fn) {
  try {
    const result = await fn();
    auditLog({
      action,
      ok: true,
      ...details,
      result_id: result?.id || result?.post_id || result?.message_id || null,
    });
    return result;
  } catch (err) {
    auditLog({
      action,
      ok: false,
      ...details,
      error: err.message,
      meta_code: err.meta?.code ?? null,
    });
    throw err;
  }
}

function wrap(fn) {
  return async (args) => {
    try {
      return await fn(args || {});
    } catch (err) {
      return errResult(err);
    }
  };
}

const tools = [];
const handlers = {};

function tool(name, description, inputSchema, handler) {
  tools.push({ name, description, inputSchema });
  handlers[name] = wrap(handler);
}

// ——— accounts ———

tool("meta_list_accounts", "List configured Meta accounts (no tokens).", { type: "object", properties: {} }, async () =>
  textResult({ accounts: listAccountsPublic() }),
);

tool(
  "ig_get_profile",
  "Get Instagram profile for the account.",
  { type: "object", properties: { account_id: accountIdProp } },
  async ({ account_id }) => {
    const { account, inferred } = pickAccount(account_id);
    const ig = requireIg(account);
    const data = await graphRequest(account, "GET", `/${ig}`, {
      query: {
        fields:
          "id,username,name,biography,website,profile_picture_url,followers_count,follows_count,media_count",
      },
    });
    return textResult({ account_id: account.id, inferred_account: inferred, ...data });
  },
);

tool(
  "ig_get_publishing_limit",
  "Instagram publishing quota (25 posts / 24h).",
  { type: "object", properties: { account_id: accountIdProp } },
  async ({ account_id }) => {
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const data = await graphRequest(account, "GET", `/${ig}/content_publishing_limit`, {
      query: { fields: "config,quota_usage" },
    });
    return textResult({ account_id: account.id, ...data });
  },
);

tool(
  "ig_list_media",
  "List recent Instagram media.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      limit: { type: "number", description: "Max items (1–50)" },
    },
  },
  async ({ account_id, limit }) => {
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const data = await graphRequest(account, "GET", `/${ig}/media`, {
      query: {
        fields:
          "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,thumbnail_url",
        limit: limit ?? 12,
      },
    });
    return textResult({ account_id: account.id, ...data });
  },
);

tool(
  "ig_get_media",
  "Get one Instagram media object.",
  {
    type: "object",
    properties: { account_id: accountIdProp, media_id: { type: "string" } },
    required: ["media_id"],
  },
  async ({ account_id, media_id }) => {
    const { account } = pickAccount(account_id);
    const data = await graphRequest(account, "GET", `/${media_id}`, {
      query: {
        fields:
          "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,thumbnail_url,children{id,media_type,media_url}",
      },
    });
    return textResult({ account_id: account.id, ...data });
  },
);

tool(
  "ig_get_media_insights",
  "Insights for one Instagram media object.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      media_id: { type: "string" },
      metrics: { type: "string" },
    },
    required: ["media_id"],
  },
  async ({ account_id, media_id, metrics }) => {
    const { account } = pickAccount(account_id);
    const data = await graphRequest(account, "GET", `/${media_id}/insights`, {
      query: { metric: metrics || "impressions,reach,engagement,saved" },
    });
    return textResult({ account_id: account.id, platform: "instagram", ...data });
  },
);

tool(
  "ig_get_account_insights",
  "Account-level Instagram insights.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      metrics: { type: "string" },
      period: { type: "string", enum: ["day", "week", "days_28"] },
      since: { type: "string" },
      until: { type: "string" },
    },
  },
  async ({ account_id, metrics, period, since, until }) => {
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const data = await graphRequest(account, "GET", `/${ig}/insights`, {
      query: {
        metric: metrics || "reach,follower_count,profile_views",
        period: period || "day",
        since,
        until,
      },
    });
    return textResult({ account_id: account.id, platform: "instagram", ...data });
  },
);

tool(
  "ig_create_image_container",
  "IG step 1: create IMAGE container (does not publish).",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      image_url: { type: "string" },
      caption: { type: "string" },
      alt_text: { type: "string" },
    },
    required: ["image_url"],
  },
  async ({ account_id, image_url, caption, alt_text }) => {
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const data = await graphRequest(account, "POST", `/${ig}/media`, {
      query: { image_url, caption, alt_text },
    });
    return textResult({
      account_id: account.id,
      creation_id: data.id,
      status: "CREATED",
      note: "Not live. Use ig_publish_container with confirm=true.",
    });
  },
);

tool(
  "ig_create_carousel_container",
  "IG step 1: create CAROUSEL (2–10 items).",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            image_url: { type: "string" },
            video_url: { type: "string" },
            alt_text: { type: "string" },
          },
        },
      },
      caption: { type: "string" },
    },
    required: ["items"],
  },
  async ({ account_id, items, caption }) => {
    if (!Array.isArray(items) || items.length < 2 || items.length > 10) {
      throw new Error("Carousel needs 2–10 items");
    }
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const childIds = [];
    for (const item of items) {
      if (!item.image_url && !item.video_url) {
        throw new Error("Each carousel item needs image_url or video_url");
      }
      const child = await graphRequest(account, "POST", `/${ig}/media`, {
        query: {
          is_carousel_item: true,
          image_url: item.image_url,
          video_url: item.video_url,
          media_type: item.video_url ? "VIDEO" : undefined,
          alt_text: item.alt_text,
        },
      });
      childIds.push(child.id);
    }
    const parent = await graphRequest(account, "POST", `/${ig}/media`, {
      query: { media_type: "CAROUSEL", children: childIds.join(","), caption },
    });
    return textResult({
      account_id: account.id,
      creation_id: parent.id,
      children: childIds,
      status: "CREATED",
    });
  },
);

tool(
  "ig_create_reel_container",
  "IG step 1: create REELS container.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      video_url: { type: "string" },
      caption: { type: "string" },
      cover_url: { type: "string" },
      share_to_feed: { type: "boolean" },
    },
    required: ["video_url"],
  },
  async ({ account_id, video_url, caption, cover_url, share_to_feed }) => {
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const data = await graphRequest(account, "POST", `/${ig}/media`, {
      query: {
        media_type: "REELS",
        video_url,
        caption,
        cover_url,
        share_to_feed: share_to_feed === undefined ? undefined : String(share_to_feed),
      },
    });
    return textResult({ account_id: account.id, creation_id: data.id, status: "CREATED" });
  },
);

tool(
  "ig_create_story_container",
  "IG step 1: create STORIES container.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      image_url: { type: "string" },
      video_url: { type: "string" },
    },
  },
  async ({ account_id, image_url, video_url }) => {
    if (!image_url && !video_url) throw new Error("Provide image_url or video_url");
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const data = await graphRequest(account, "POST", `/${ig}/media`, {
      query: { media_type: "STORIES", image_url, video_url },
    });
    return textResult({ account_id: account.id, creation_id: data.id, status: "CREATED" });
  },
);

tool(
  "ig_get_container_status",
  "Poll IG media container status.",
  {
    type: "object",
    properties: { account_id: accountIdProp, creation_id: { type: "string" } },
    required: ["creation_id"],
  },
  async ({ account_id, creation_id }) => {
    const { account } = pickAccount(account_id);
    const data = await graphRequest(account, "GET", `/${creation_id}`, {
      query: { fields: "id,status_code,status" },
    });
    return textResult({ account_id: account.id, ...data });
  },
);

tool(
  "ig_publish_container",
  "IG step 2: publish container. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      creation_id: { type: "string" },
      confirm: { type: "boolean" },
      wait_for_ready: { type: "boolean" },
    },
    required: ["creation_id", "confirm"],
  },
  async ({ account_id, creation_id, confirm, wait_for_ready }) => {
    requireConfirm(confirm, "ig_publish_container");
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const result = await audited(
      "ig_publish_container",
      { account_id: account.id, platform: "instagram", creation_id },
      async () => {
        if (wait_for_ready) await waitForContainer(account, creation_id);
        return graphRequest(account, "POST", `/${ig}/media_publish`, {
          query: { creation_id },
        });
      },
    );
    return textResult({ published: true, account_id: account.id, ...result });
  },
);

tool(
  "ig_publish_image",
  "Create + publish IG image. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      image_url: { type: "string" },
      caption: { type: "string" },
      alt_text: { type: "string" },
      confirm: { type: "boolean" },
    },
    required: ["image_url", "confirm"],
  },
  async ({ account_id, image_url, caption, alt_text, confirm }) => {
    requireConfirm(confirm, "ig_publish_image");
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const result = await audited(
      "ig_publish_image",
      {
        account_id: account.id,
        platform: "instagram",
        caption_preview: (caption || "").slice(0, 120),
      },
      async () => {
        const container = await graphRequest(account, "POST", `/${ig}/media`, {
          query: { image_url, caption, alt_text },
        });
        return graphRequest(account, "POST", `/${ig}/media_publish`, {
          query: { creation_id: container.id },
        });
      },
    );
    return textResult({ published: true, account_id: account.id, ...result });
  },
);

tool(
  "ig_publish_carousel",
  "Create + publish IG carousel. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      items: { type: "array", items: { type: "object" } },
      caption: { type: "string" },
      confirm: { type: "boolean" },
    },
    required: ["items", "confirm"],
  },
  async ({ account_id, items, caption, confirm }) => {
    requireConfirm(confirm, "ig_publish_carousel");
    if (!Array.isArray(items) || items.length < 2 || items.length > 10) {
      throw new Error("Carousel needs 2–10 items");
    }
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const result = await audited(
      "ig_publish_carousel",
      {
        account_id: account.id,
        platform: "instagram",
        item_count: items.length,
        caption_preview: (caption || "").slice(0, 120),
      },
      async () => {
        const childIds = [];
        for (const item of items) {
          const child = await graphRequest(account, "POST", `/${ig}/media`, {
            query: {
              is_carousel_item: true,
              image_url: item.image_url,
              video_url: item.video_url,
              media_type: item.video_url ? "VIDEO" : undefined,
              alt_text: item.alt_text,
            },
          });
          childIds.push(child.id);
        }
        const parent = await graphRequest(account, "POST", `/${ig}/media`, {
          query: { media_type: "CAROUSEL", children: childIds.join(","), caption },
        });
        return graphRequest(account, "POST", `/${ig}/media_publish`, {
          query: { creation_id: parent.id },
        });
      },
    );
    return textResult({ published: true, account_id: account.id, ...result });
  },
);

tool(
  "ig_publish_reel",
  "Create + publish IG Reel. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      video_url: { type: "string" },
      caption: { type: "string" },
      cover_url: { type: "string" },
      share_to_feed: { type: "boolean" },
      confirm: { type: "boolean" },
    },
    required: ["video_url", "confirm"],
  },
  async ({ account_id, video_url, caption, cover_url, share_to_feed, confirm }) => {
    requireConfirm(confirm, "ig_publish_reel");
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const result = await audited(
      "ig_publish_reel",
      {
        account_id: account.id,
        platform: "instagram",
        caption_preview: (caption || "").slice(0, 120),
      },
      async () => {
        const container = await graphRequest(account, "POST", `/${ig}/media`, {
          query: {
            media_type: "REELS",
            video_url,
            caption,
            cover_url,
            share_to_feed:
              share_to_feed === undefined ? undefined : String(share_to_feed),
          },
        });
        await waitForContainer(account, container.id);
        return graphRequest(account, "POST", `/${ig}/media_publish`, {
          query: { creation_id: container.id },
        });
      },
    );
    return textResult({ published: true, account_id: account.id, ...result });
  },
);

tool(
  "ig_publish_story",
  "Create + publish IG Story. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      image_url: { type: "string" },
      video_url: { type: "string" },
      confirm: { type: "boolean" },
    },
    required: ["confirm"],
  },
  async ({ account_id, image_url, video_url, confirm }) => {
    requireConfirm(confirm, "ig_publish_story");
    if (!image_url && !video_url) throw new Error("Provide image_url or video_url");
    const { account } = pickAccount(account_id);
    const ig = requireIg(account);
    const result = await audited(
      "ig_publish_story",
      { account_id: account.id, platform: "instagram", has_video: Boolean(video_url) },
      async () => {
        const container = await graphRequest(account, "POST", `/${ig}/media`, {
          query: { media_type: "STORIES", image_url, video_url },
        });
        if (video_url) await waitForContainer(account, container.id);
        return graphRequest(account, "POST", `/${ig}/media_publish`, {
          query: { creation_id: container.id },
        });
      },
    );
    return textResult({ published: true, account_id: account.id, ...result });
  },
);

tool(
  "ig_get_comments",
  "List comments on an IG media object.",
  {
    type: "object",
    properties: { account_id: accountIdProp, media_id: { type: "string" } },
    required: ["media_id"],
  },
  async ({ account_id, media_id }) => {
    const { account } = pickAccount(account_id);
    const data = await graphRequest(account, "GET", `/${media_id}/comments`, {
      query: {
        fields: "id,text,username,timestamp,like_count,replies{id,text,username,timestamp}",
      },
    });
    return textResult({ account_id: account.id, platform: "instagram", ...data });
  },
);

tool(
  "ig_reply_to_comment",
  "Reply to an IG comment. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      comment_id: { type: "string" },
      message: { type: "string" },
      confirm: { type: "boolean" },
    },
    required: ["comment_id", "message", "confirm"],
  },
  async ({ account_id, comment_id, message, confirm }) => {
    requireConfirm(confirm, "ig_reply_to_comment");
    const { account } = pickAccount(account_id);
    const result = await audited(
      "ig_reply_comment",
      {
        account_id: account.id,
        platform: "instagram",
        comment_id,
        message_preview: message.slice(0, 120),
      },
      () =>
        graphRequest(account, "POST", `/${comment_id}/replies`, {
          query: { message },
        }),
    );
    return textResult({ account_id: account.id, ...result });
  },
);

tool(
  "ig_hide_comment",
  "Hide/unhide an IG comment. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      comment_id: { type: "string" },
      hide: { type: "boolean" },
      confirm: { type: "boolean" },
    },
    required: ["comment_id", "hide", "confirm"],
  },
  async ({ account_id, comment_id, hide, confirm }) => {
    requireConfirm(confirm, "ig_hide_comment");
    const { account } = pickAccount(account_id);
    const result = await audited(
      "ig_hide_comment",
      { account_id: account.id, platform: "instagram", comment_id, hide },
      () =>
        graphRequest(account, "POST", `/${comment_id}`, {
          query: { hide: String(hide) },
        }),
    );
    return textResult({ account_id: account.id, ...result });
  },
);

tool(
  "ig_delete_comment",
  "Delete an IG comment. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      comment_id: { type: "string" },
      confirm: { type: "boolean" },
    },
    required: ["comment_id", "confirm"],
  },
  async ({ account_id, comment_id, confirm }) => {
    requireConfirm(confirm, "ig_delete_comment");
    const { account } = pickAccount(account_id);
    const result = await audited(
      "ig_delete_comment",
      { account_id: account.id, platform: "instagram", comment_id },
      () => graphRequest(account, "DELETE", `/${comment_id}`),
    );
    return textResult({ account_id: account.id, ...result });
  },
);

tool(
  "meta_list_conversations",
  "List Page conversations (Instagram or Messenger).",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      platform: { type: "string", enum: ["instagram", "messenger"] },
      limit: { type: "number" },
    },
  },
  async ({ account_id, platform, limit }) => {
    const { account } = pickAccount(account_id);
    const pageId = requirePage(account);
    const data = await graphRequest(account, "GET", `/${pageId}/conversations`, {
      query: {
        platform: platform || "instagram",
        fields: "id,updated_time,participants,message_count",
        limit: limit ?? 20,
      },
    });
    return textResult({ account_id: account.id, ...data });
  },
);

tool(
  "meta_get_conversation_messages",
  "Read messages in a conversation.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      conversation_id: { type: "string" },
      limit: { type: "number" },
    },
    required: ["conversation_id"],
  },
  async ({ account_id, conversation_id, limit }) => {
    const { account } = pickAccount(account_id);
    const data = await graphRequest(account, "GET", `/${conversation_id}/messages`, {
      query: {
        fields: "id,created_time,from,to,message",
        limit: limit ?? 20,
      },
    });
    return textResult({ account_id: account.id, ...data });
  },
);

tool(
  "meta_send_dm",
  "Send a DM via the Page. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      recipient_id: { type: "string" },
      message: { type: "string" },
      confirm: { type: "boolean" },
    },
    required: ["recipient_id", "message", "confirm"],
  },
  async ({ account_id, recipient_id, message, confirm }) => {
    requireConfirm(confirm, "meta_send_dm");
    const { account } = pickAccount(account_id);
    const pageId = requirePage(account);
    const result = await audited(
      "meta_send_dm",
      {
        account_id: account.id,
        platform: "messaging",
        recipient_id,
        message_preview: message.slice(0, 120),
      },
      () =>
        graphRequest(account, "POST", `/${pageId}/messages`, {
          body: {
            recipient: { id: recipient_id },
            message: { text: message },
          },
        }),
    );
    return textResult({ account_id: account.id, ...result });
  },
);

tool(
  "fb_get_page",
  "Get Facebook Page profile.",
  { type: "object", properties: { account_id: accountIdProp } },
  async ({ account_id }) => {
    const { account, inferred } = pickAccount(account_id);
    const pageId = requirePage(account);
    const data = await graphRequest(account, "GET", `/${pageId}`, {
      query: {
        fields: "id,name,about,fan_count,followers_count,link,username,category",
      },
    });
    return textResult({ account_id: account.id, inferred_account: inferred, ...data });
  },
);

tool(
  "fb_list_posts",
  "List recent Facebook Page posts.",
  {
    type: "object",
    properties: { account_id: accountIdProp, limit: { type: "number" } },
  },
  async ({ account_id, limit }) => {
    const { account } = pickAccount(account_id);
    const pageId = requirePage(account);
    const data = await graphRequest(account, "GET", `/${pageId}/posts`, {
      query: {
        fields: "id,message,created_time,permalink_url,full_picture,status_type",
        limit: limit ?? 12,
      },
    });
    return textResult({ account_id: account.id, platform: "facebook", ...data });
  },
);

tool(
  "fb_get_post",
  "Get one Facebook Page post.",
  {
    type: "object",
    properties: { account_id: accountIdProp, post_id: { type: "string" } },
    required: ["post_id"],
  },
  async ({ account_id, post_id }) => {
    const { account } = pickAccount(account_id);
    const data = await graphRequest(account, "GET", `/${post_id}`, {
      query: {
        fields: "id,message,created_time,permalink_url,full_picture,shares,reactions.summary(true)",
      },
    });
    return textResult({ account_id: account.id, platform: "facebook", ...data });
  },
);

tool(
  "fb_publish_post",
  "Publish a Facebook Page feed post. Optional schedule. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      message: { type: "string" },
      link: { type: "string" },
      scheduled_publish_time: { type: "number", description: "Unix timestamp" },
      confirm: { type: "boolean" },
    },
    required: ["message", "confirm"],
  },
  async ({ account_id, message, link, scheduled_publish_time, confirm }) => {
    requireConfirm(confirm, "fb_publish_post");
    const { account } = pickAccount(account_id);
    const pageId = requirePage(account);
    const query = { message, link };
    if (scheduled_publish_time) {
      query.published = "false";
      query.scheduled_publish_time = String(scheduled_publish_time);
    }
    const result = await audited(
      "fb_publish_post",
      {
        account_id: account.id,
        platform: "facebook",
        scheduled: Boolean(scheduled_publish_time),
        message_preview: message.slice(0, 120),
      },
      () => graphRequest(account, "POST", `/${pageId}/feed`, { query }),
    );
    return textResult({ published: !scheduled_publish_time, account_id: account.id, ...result });
  },
);

tool(
  "fb_publish_photo",
  "Publish a photo to the Facebook Page. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      url: { type: "string" },
      caption: { type: "string" },
      scheduled_publish_time: { type: "number" },
      confirm: { type: "boolean" },
    },
    required: ["url", "confirm"],
  },
  async ({ account_id, url, caption, scheduled_publish_time, confirm }) => {
    requireConfirm(confirm, "fb_publish_photo");
    const { account } = pickAccount(account_id);
    const pageId = requirePage(account);
    const query = { url, caption };
    if (scheduled_publish_time) {
      query.published = "false";
      query.scheduled_publish_time = String(scheduled_publish_time);
    }
    const result = await audited(
      "fb_publish_photo",
      {
        account_id: account.id,
        platform: "facebook",
        scheduled: Boolean(scheduled_publish_time),
        caption_preview: (caption || "").slice(0, 120),
      },
      () => graphRequest(account, "POST", `/${pageId}/photos`, { query }),
    );
    return textResult({ published: !scheduled_publish_time, account_id: account.id, ...result });
  },
);

tool(
  "fb_publish_video",
  "Publish a video to the Facebook Page. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      file_url: { type: "string" },
      description: { type: "string" },
      title: { type: "string" },
      scheduled_publish_time: { type: "number" },
      confirm: { type: "boolean" },
    },
    required: ["file_url", "confirm"],
  },
  async ({ account_id, file_url, description, title, scheduled_publish_time, confirm }) => {
    requireConfirm(confirm, "fb_publish_video");
    const { account } = pickAccount(account_id);
    const pageId = requirePage(account);
    const query = { file_url, description, title };
    if (scheduled_publish_time) {
      query.published = "false";
      query.scheduled_publish_time = String(scheduled_publish_time);
    }
    const result = await audited(
      "fb_publish_video",
      {
        account_id: account.id,
        platform: "facebook",
        scheduled: Boolean(scheduled_publish_time),
        description_preview: (description || "").slice(0, 120),
      },
      () => graphRequest(account, "POST", `/${pageId}/videos`, { query }),
    );
    return textResult({ published: !scheduled_publish_time, account_id: account.id, ...result });
  },
);

tool(
  "fb_get_page_insights",
  "Facebook Page insights.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      metrics: { type: "string" },
      period: { type: "string", enum: ["day", "week", "days_28"] },
      since: { type: "string" },
      until: { type: "string" },
    },
  },
  async ({ account_id, metrics, period, since, until }) => {
    const { account } = pickAccount(account_id);
    const pageId = requirePage(account);
    const data = await graphRequest(account, "GET", `/${pageId}/insights`, {
      query: {
        metric: metrics || "page_impressions,page_engaged_users,page_fan_adds",
        period: period || "day",
        since,
        until,
      },
    });
    return textResult({ account_id: account.id, platform: "facebook", ...data });
  },
);

tool(
  "fb_get_comments",
  "List comments on a Facebook post/object.",
  {
    type: "object",
    properties: { account_id: accountIdProp, object_id: { type: "string" } },
    required: ["object_id"],
  },
  async ({ account_id, object_id }) => {
    const { account } = pickAccount(account_id);
    const data = await graphRequest(account, "GET", `/${object_id}/comments`, {
      query: {
        fields: "id,message,created_time,from,comment_count,like_count",
      },
    });
    return textResult({ account_id: account.id, platform: "facebook", ...data });
  },
);

tool(
  "fb_reply_to_comment",
  "Reply to a Facebook comment. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      comment_id: { type: "string" },
      message: { type: "string" },
      confirm: { type: "boolean" },
    },
    required: ["comment_id", "message", "confirm"],
  },
  async ({ account_id, comment_id, message, confirm }) => {
    requireConfirm(confirm, "fb_reply_to_comment");
    const { account } = pickAccount(account_id);
    const result = await audited(
      "fb_reply_comment",
      {
        account_id: account.id,
        platform: "facebook",
        comment_id,
        message_preview: message.slice(0, 120),
      },
      () =>
        graphRequest(account, "POST", `/${comment_id}/comments`, {
          query: { message },
        }),
    );
    return textResult({ account_id: account.id, ...result });
  },
);

tool(
  "fb_delete_comment",
  "Delete a Facebook comment. Requires confirm=true.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      comment_id: { type: "string" },
      confirm: { type: "boolean" },
    },
    required: ["comment_id", "confirm"],
  },
  async ({ account_id, comment_id, confirm }) => {
    requireConfirm(confirm, "fb_delete_comment");
    const { account } = pickAccount(account_id);
    const result = await audited(
      "fb_delete_comment",
      { account_id: account.id, platform: "facebook", comment_id },
      () => graphRequest(account, "DELETE", `/${comment_id}`),
    );
    return textResult({ account_id: account.id, ...result });
  },
);

tool(
  "meta_preview_post",
  "Dry-run preview for IG or FB. Does not publish.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      platform: { type: "string", enum: ["instagram", "facebook"] },
      media_type: {
        type: "string",
        enum: ["IMAGE", "CAROUSEL", "REELS", "STORIES", "FEED", "PHOTO", "VIDEO"],
      },
      caption: { type: "string" },
      message: { type: "string" },
      image_url: { type: "string" },
      video_url: { type: "string" },
      link: { type: "string" },
      items: { type: "array", items: { type: "object" } },
      scheduled_publish_time: { type: "number" },
    },
    required: ["platform", "media_type"],
  },
  async (args) => {
    const { account, inferred } = pickAccount(args.account_id);
    const issues = [];
    if (args.platform === "instagram") {
      if (!account.ig_business_account_id) issues.push("Account has no Instagram ID");
      if (args.media_type === "IMAGE" && !args.image_url) issues.push("IMAGE needs image_url");
      if (args.media_type === "REELS" && !args.video_url) issues.push("REELS needs video_url");
      if (args.media_type === "STORIES" && !args.image_url && !args.video_url) {
        issues.push("STORIES needs image_url or video_url");
      }
      if (args.media_type === "CAROUSEL") {
        const n = args.items?.length ?? 0;
        if (n < 2 || n > 10) issues.push("CAROUSEL needs 2–10 items");
      }
      if (args.scheduled_publish_time) {
        issues.push("Organic IG has no native schedule_publish_time");
      }
    } else {
      if (!account.page_id) issues.push("Account has no page_id");
      if (args.media_type === "FEED" && !(args.message || args.caption)) {
        issues.push("FEED needs message/caption");
      }
      if (args.media_type === "PHOTO" && !args.image_url) issues.push("PHOTO needs image_url");
      if (args.media_type === "VIDEO" && !args.video_url) issues.push("VIDEO needs video_url");
    }
    const text = args.caption || args.message || "";
    if (args.platform === "instagram" && text.length > 2200) {
      issues.push("Caption exceeds Instagram 2200-character limit");
    }
    return textResult({
      ready: issues.length === 0,
      issues,
      account_id: account.id,
      inferred_account: inferred,
      brand: account.brand,
      planned: {
        platform: args.platform,
        media_type: args.media_type,
        caption: args.caption || null,
        message: args.message || null,
        image_url: args.image_url || null,
        video_url: args.video_url || null,
        link: args.link || null,
        items: args.items || null,
        scheduled_publish_time: args.scheduled_publish_time || null,
        page_id: account.page_id,
        ig_business_account_id: account.ig_business_account_id,
      },
      next_step:
        issues.length === 0
          ? "Show this preview. Publish only after explicit approval with confirm=true."
          : "Fix issues before publishing.",
    });
  },
);

tool(
  "meta_exchange_long_lived_token",
  "Exchange a short-lived token for a long-lived one (~60 days).",
  {
    type: "object",
    properties: { short_lived_token: { type: "string" } },
    required: ["short_lived_token"],
  },
  async ({ short_lived_token }) => {
    const { appId, appSecret } = getAppCredentials();
    const data = await oauthRequest({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: short_lived_token,
    });
    return textResult({
      ...data,
      note: "Save access_token as META_PAGE_ACCESS_TOKEN in .env (never commit). Restart MCP.",
    });
  },
);

tool(
  "meta_refresh_account_token",
  "Refresh the account long-lived token. Requires confirm=true; you must save the new token.",
  {
    type: "object",
    properties: { account_id: accountIdProp, confirm: { type: "boolean" } },
    required: ["confirm"],
  },
  async ({ account_id, confirm }) => {
    requireConfirm(confirm, "meta_refresh_account_token");
    const { account } = pickAccount(account_id);
    const { appId, appSecret } = getAppCredentials();
    const data = await oauthRequest({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: account.page_access_token,
    });
    auditLog({
      action: "refresh_token",
      ok: true,
      account_id: account.id,
      platform: "meta",
      expires_in: data.expires_in ?? null,
    });
    return textResult({
      account_id: account.id,
      ...data,
      note: `Update META_PAGE_ACCESS_TOKEN (or META_ACCOUNTS entry for "${account.id}"), then restart MCP.`,
    });
  },
);

tool(
  "meta_debug_account_token",
  "Inspect token validity/scopes/expiry.",
  {
    type: "object",
    properties: {
      account_id: accountIdProp,
      input_token: { type: "string" },
    },
  },
  async ({ account_id, input_token }) => {
    const { appId, appSecret } = getAppCredentials();
    let token = input_token;
    let resolvedId = null;
    if (!token) {
      const { account } = pickAccount(account_id);
      token = account.page_access_token;
      resolvedId = account.id;
    }
    const data = await debugToken(token, appId, appSecret);
    return textResult({ account_id: resolvedId, ...data });
  },
);

export { tools, handlers };
