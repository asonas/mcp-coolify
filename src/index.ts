#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CoolifyClient } from "./client.js";
import { registerTools } from "./tools.js";

const COOLIFY_API_TOKEN = process.env.COOLIFY_API_TOKEN;
const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL;

if (!COOLIFY_API_TOKEN) {
  console.error("Error: COOLIFY_API_TOKEN environment variable is required");
  process.exit(1);
}

if (!COOLIFY_BASE_URL) {
  console.error("Error: COOLIFY_BASE_URL environment variable is required");
  process.exit(1);
}

const client = new CoolifyClient({
  baseUrl: COOLIFY_BASE_URL,
  apiToken: COOLIFY_API_TOKEN,
});

const server = new McpServer({
  name: "mcp-coolify",
  version: "0.1.0",
});

registerTools(server, client);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-coolify server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
