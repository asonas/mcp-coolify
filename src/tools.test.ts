import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CoolifyClient } from "./client.js";
import { registerTools } from "./tools.js";

describe("registerTools", () => {
  let server: McpServer;
  let client: CoolifyClient;

  beforeEach(() => {
    server = new McpServer({ name: "test", version: "0.0.1" });
    client = new CoolifyClient({
      baseUrl: "https://coolify.example.com",
      apiToken: "test-token",
    });
  });

  it("should register all 11 tools", () => {
    const toolSpy = vi.spyOn(server, "tool");

    registerTools(server, client);

    expect(toolSpy).toHaveBeenCalledTimes(11);

    const registeredNames = toolSpy.mock.calls.map((call) => call[0]);
    expect(registeredNames).toEqual([
      "list_applications",
      "list_services",
      "get_application",
      "get_service",
      "deploy",
      "get_application_logs",
      "list_deployments",
      "get_deployment",
      "restart_application",
      "restart_service",
      "list_servers",
    ]);
  });
});
