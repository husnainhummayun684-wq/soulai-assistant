#!/usr/bin/env node
/**
 * Load workspace `.env`, then spawn an MCP server via npx.
 *
 * Cursor's `${env:VAR}` interpolates from the *host* process environment and
 * does not see values from `envFile`. Putting empty `${env:...}` entries in
 * `mcp.json` overrides `envFile` and breaks servers that require secrets.
 *
 * Usage: node .cursor/run-mcp.mjs <npm-package> [...package-args]
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");

function loadEnvFile(file) {
  if (!existsSync(file)) {
    console.error(`[run-mcp] Missing ${file}`);
    return;
  }
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Do not clobber vars already set by the host / Cursor.
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

function resolveNpxCli() {
  const nodeDir = dirname(process.execPath);
  const candidates = [
    join(nodeDir, "node_modules", "npm", "bin", "npx-cli.js"),
    join(root, "node_modules", "npm", "bin", "npx-cli.js"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

loadEnvFile(envPath);

// Official Notion MCP expects NOTION_TOKEN; team .env documents NOTION_API_KEY.
if (process.env.NOTION_API_KEY && !process.env.NOTION_TOKEN) {
  process.env.NOTION_TOKEN = process.env.NOTION_API_KEY;
}

const [pkg, ...pkgArgs] = process.argv.slice(2);
if (!pkg) {
  console.error("Usage: node .cursor/run-mcp.mjs <npm-package> [...args]");
  process.exit(1);
}

const npxCli = resolveNpxCli();
const child = npxCli
  ? spawn(process.execPath, [npxCli, "-y", pkg, ...pkgArgs], {
      stdio: "inherit",
      env: process.env,
      cwd: root,
      windowsHide: true,
    })
  : spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["-y", pkg, ...pkgArgs], {
      stdio: "inherit",
      env: process.env,
      cwd: root,
      shell: true,
      windowsHide: true,
    });

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (err) => {
  console.error(`[run-mcp] Failed to start MCP server: ${err.message}`);
  process.exit(1);
});
