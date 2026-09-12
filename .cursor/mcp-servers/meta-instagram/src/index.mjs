#!/usr/bin/env node
/**
 * SoulPlus AI — Meta Graph API MCP (Instagram + Facebook).
 * Zero npm dependencies. Run with: node src/index.mjs
 * Loads workspace `.env` automatically.
 */
import { loadWorkspaceEnv } from "./env.mjs";
import { startMcpStdioServer } from "./mcp-stdio.mjs";
import { handlers, tools } from "./tools.mjs";

loadWorkspaceEnv();

startMcpStdioServer({
  name: "soulai-meta",
  version: "3.0.0",
  tools,
  handlers,
});
