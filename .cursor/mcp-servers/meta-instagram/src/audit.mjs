import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const defaultLogPath = resolve(root, "logs", "meta-audit.jsonl");

/**
 * Append one audit line for publish/reply attempts.
 * Never logs access tokens or secrets.
 */
export function auditLog(entry, logPath = process.env.META_AUDIT_LOG_PATH || defaultLogPath) {
  const dir = dirname(logPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const line = JSON.stringify({
    ts: new Date().toISOString(),
    ...entry,
  });
  appendFileSync(logPath, line + "\n", "utf8");
}
