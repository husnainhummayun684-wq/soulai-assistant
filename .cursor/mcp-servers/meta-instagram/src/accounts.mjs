import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

/**
 * Load Meta account config.
 *
 * Default (single account): META_PAGE_ACCESS_TOKEN + META_PAGE_ID and/or
 * META_IG_BUSINESS_ACCOUNT_ID. Optional META_ACCOUNT_ID (slug, default "default").
 *
 * Multi-account (optional): META_ACCOUNTS (JSON array) or META_ACCOUNTS_FILE.
 * When multi-account is set, it overrides the single-account vars.
 *
 * Each account object (multi):
 * {
 *   "id": "soulplus",
 *   "label": "SoulPlus AI",
 *   "brand": "soulplus",
 *   "page_id": "123",
 *   "page_access_token": "...",
 *   "ig_business_account_id": "456"
 * }
 */

function parseAccountsJson(raw, source) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${source}: ${err.message}`);
  }
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`${source} must be a non-empty JSON array of accounts`);
  }
  const seen = new Set();
  return data.map((row, i) => {
    if (!row || typeof row !== "object") {
      throw new Error(`${source}[${i}] must be an object`);
    }
    const id = String(row.id || "").trim();
    if (!id) throw new Error(`${source}[${i}] missing id`);
    if (seen.has(id)) throw new Error(`${source}: duplicate account id "${id}"`);
    seen.add(id);
    const token = String(row.page_access_token || row.access_token || "").trim();
    if (!token) throw new Error(`${source} account "${id}" missing page_access_token`);
    const pageId = String(row.page_id || "").trim();
    const igId = String(row.ig_business_account_id || row.ig_user_id || "").trim();
    if (!pageId && !igId) {
      throw new Error(
        `${source} account "${id}" needs page_id and/or ig_business_account_id`,
      );
    }
    return {
      id,
      label: String(row.label || id),
      brand: row.brand ? String(row.brand) : null,
      page_id: pageId || null,
      page_access_token: token,
      ig_business_account_id: igId || null,
    };
  });
}

function loadSingleAccount() {
  const token = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  if (!token) return null;
  const pageId = process.env.META_PAGE_ID?.trim() || null;
  const igId = process.env.META_IG_BUSINESS_ACCOUNT_ID?.trim() || null;
  if (!pageId && !igId) {
    throw new Error(
      "Single-account Meta config needs META_PAGE_ID and/or META_IG_BUSINESS_ACCOUNT_ID (with META_PAGE_ACCESS_TOKEN).",
    );
  }
  const id = (process.env.META_ACCOUNT_ID || "default").trim() || "default";
  return [
    {
      id,
      label: process.env.META_ACCOUNT_LABEL?.trim() || id,
      brand: process.env.META_ACCOUNT_BRAND?.trim() || null,
      page_id: pageId,
      page_access_token: token,
      ig_business_account_id: igId,
    },
  ];
}

let cached = null;

export function loadAccounts({ force = false } = {}) {
  if (cached && !force) return cached;

  const file = process.env.META_ACCOUNTS_FILE?.trim();
  const raw = process.env.META_ACCOUNTS?.trim();

  // Multi-account only when explicitly configured (non-empty).
  if (file) {
    const path = resolve(workspaceRoot, file);
    if (!existsSync(path)) {
      throw new Error(`META_ACCOUNTS_FILE not found: ${path}`);
    }
    cached = parseAccountsJson(readFileSync(path, "utf8"), `META_ACCOUNTS_FILE (${file})`);
    return cached;
  }
  if (raw) {
    cached = parseAccountsJson(raw, "META_ACCOUNTS");
    return cached;
  }

  const single = loadSingleAccount();
  if (single) {
    cached = single;
    return cached;
  }

  throw new Error(
    "No Meta account configured. Set META_PAGE_ACCESS_TOKEN + META_PAGE_ID and/or META_IG_BUSINESS_ACCOUNT_ID (single account), or META_ACCOUNTS / META_ACCOUNTS_FILE for multiple.",
  );
}

/** Public summary — never includes tokens. */
export function listAccountsPublic() {
  return loadAccounts().map((a) => ({
    id: a.id,
    label: a.label,
    brand: a.brand,
    page_id: a.page_id,
    has_instagram: Boolean(a.ig_business_account_id),
    has_facebook_page: Boolean(a.page_id),
  }));
}

/**
 * Resolve account by id.
 * Single account: account_id optional (uses the only configured account).
 * Multiple accounts: account_id required — never guess.
 */
export function resolveAccount(accountId) {
  const accounts = loadAccounts();
  const id = accountId != null ? String(accountId).trim() : "";

  if (!id) {
    if (accounts.length === 1) {
      return { account: accounts[0], inferred: true };
    }
    const ids = accounts.map((a) => a.id).join(", ");
    throw new Error(
      `account_id is required when multiple Meta accounts are configured. Available: ${ids}`,
    );
  }

  const account = accounts.find((a) => a.id === id);
  if (!account) {
    const ids = accounts.map((a) => a.id).join(", ");
    throw new Error(`Unknown account_id "${id}". Available: ${ids}`);
  }
  return { account, inferred: false };
}

export function requireIg(account) {
  if (!account.ig_business_account_id) {
    throw new Error(
      `Account "${account.id}" has no ig_business_account_id (Instagram not linked in config)`,
    );
  }
  return account.ig_business_account_id;
}

export function requirePage(account) {
  if (!account.page_id) {
    throw new Error(
      `Account "${account.id}" has no page_id (Facebook Page ID required for this action)`,
    );
  }
  return account.page_id;
}

export function getAppCredentials() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("META_APP_ID and META_APP_SECRET are required for token tools");
  }
  return { appId, appSecret };
}
