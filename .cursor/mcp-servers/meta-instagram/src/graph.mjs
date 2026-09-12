const DEFAULT_API_VERSION = "v22.0";

function apiVersion() {
  return process.env.META_API_VERSION || DEFAULT_API_VERSION;
}

function baseUrl() {
  return `https://graph.facebook.com/${apiVersion()}`;
}

/**
 * Call Meta Graph API with a specific account's Page access token.
 */
export async function graphRequest(account, method, path, { query, body } = {}) {
  if (!account?.page_access_token) {
    throw new Error("graphRequest requires an account with page_access_token");
  }
  const url = new URL(path.startsWith("http") ? path : `${baseUrl()}${path}`);
  url.searchParams.set("access_token", account.page_access_token);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const init = { method: method.toUpperCase() };
  if (body && init.method !== "GET" && init.method !== "DELETE") {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const err = data.error || {};
    const msg = [
      `Graph API ${res.status}`,
      err.message || res.statusText,
      err.code != null ? `code=${err.code}` : null,
      err.error_subcode != null ? `subcode=${err.error_subcode}` : null,
      err.type ? `type=${err.type}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
    const e = new Error(msg);
    e.meta = err;
    e.status = res.status;
    throw e;
  }
  return data;
}

/** App-token or unversioned OAuth helpers (no Page token). */
export async function oauthRequest(query) {
  const url = new URL("https://graph.facebook.com/oauth/access_token");
  for (const [k, v] of Object.entries(query)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const err = data.error || {};
    throw new Error(err.message || `OAuth error ${res.status}`);
  }
  return data;
}

export async function debugToken(inputToken, appId, appSecret) {
  const url = new URL(`${baseUrl()}/debug_token`);
  url.searchParams.set("input_token", inputToken);
  url.searchParams.set("access_token", `${appId}|${appSecret}`);
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `debug_token failed ${res.status}`);
  }
  return data;
}

export async function waitForContainer(account, creationId, { maxAttempts = 30, delayMs = 2000 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await graphRequest(account, "GET", `/${creationId}`, {
      query: { fields: "status_code,status" },
    });
    const code = status.status_code;
    if (code === "FINISHED") return status;
    if (code === "ERROR" || code === "EXPIRED") {
      throw new Error(`Container ${creationId} failed: ${code} ${JSON.stringify(status)}`);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Container ${creationId} still processing after ${maxAttempts} polls`);
}
