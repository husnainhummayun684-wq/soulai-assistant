/**
 * Minimal MCP server over stdio (JSON-RPC + Content-Length framing).
 * Zero npm dependencies — Node.js 18+ only.
 */
export function startMcpStdioServer({ name, version, tools, handlers }) {
  const toolList = tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema || { type: "object", properties: {} },
  }));

  function writeMessage(msg) {
    const json = JSON.stringify(msg);
    const body = Buffer.from(json, "utf8");
    process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
    process.stdout.write(body);
  }

  function sendResult(id, result) {
    writeMessage({ jsonrpc: "2.0", id, result });
  }

  function sendError(id, code, message, data) {
    writeMessage({
      jsonrpc: "2.0",
      id,
      error: { code, message, ...(data !== undefined ? { data } : {}) },
    });
  }

  async function handleRequest(msg) {
    const { id, method, params } = msg;

    if (method === "initialize") {
      sendResult(id, {
        protocolVersion: params?.protocolVersion || "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name, version },
      });
      return;
    }

    if (method === "notifications/initialized" || method === "initialized") {
      return;
    }

    if (method === "ping") {
      sendResult(id, {});
      return;
    }

    if (method === "tools/list") {
      sendResult(id, { tools: toolList });
      return;
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};
      const handler = handlers[toolName];
      if (!handler) {
        sendError(id, -32601, `Unknown tool: ${toolName}`);
        return;
      }
      try {
        const result = await handler(args);
        sendResult(id, result);
      } catch (err) {
        sendResult(id, {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        });
      }
      return;
    }

    if (id !== undefined) {
      sendError(id, -32601, `Method not found: ${method}`);
    }
  }

  // Content-Length framed stream
  let buffer = Buffer.alloc(0);
  process.stdin.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) break;
      const header = buffer.slice(0, headerEnd).toString("utf8");
      const match = /Content-Length:\s*(\d+)/i.exec(header);
      if (!match) {
        buffer = buffer.slice(headerEnd + 4);
        continue;
      }
      const length = Number(match[1]);
      const start = headerEnd + 4;
      if (buffer.length < start + length) break;
      const body = buffer.slice(start, start + length).toString("utf8");
      buffer = buffer.slice(start + length);
      let msg;
      try {
        msg = JSON.parse(body);
      } catch {
        continue;
      }
      Promise.resolve(handleRequest(msg)).catch((err) => {
        if (msg.id !== undefined) {
          sendError(msg.id, -32603, err.message || "Internal error");
        }
      });
    }
  });

  // Fallback: line-delimited JSON (some clients)
  // Only used if no Content-Length ever arrives — keep stdin binary mode above.
  // Cursor/MCP uses Content-Length; line mode is a backup via separate path if needed.

  process.stdin.resume();
}
