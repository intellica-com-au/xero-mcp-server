#!/usr/bin/env node

import { authServer } from "./auth-server/auth-server.js";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { XeroMcpServer } from "./server/xero-mcp-server.js";
import { ToolFactory } from "./tools/tool-factory.js";

process.stdin.resume();

const main = async () => {
  // Create an MCP server
  const server = XeroMcpServer.GetServer();

  ToolFactory(server);

  const authServerInstance = authServer();

  [
    `exit`,
    `SIGINT`,
    `SIGUSR1`,
    `SIGUSR2`,
    `uncaughtException`,
    `SIGTERM`,
  ].forEach((eventType) => {
    process.on(eventType, authServerInstance.close);
  });

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await Promise.all([authServer(), server.connect(transport)]);
};

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
