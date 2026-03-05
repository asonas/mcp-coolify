import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CoolifyClient } from "./client.js";
import { registerTools, pickFields } from "./tools.js";

describe("pickFields", () => {
  it("should return empty array for empty input", () => {
    expect(pickFields([], ["uuid"])).toEqual([]);
  });

  it("should pick only specified fields from each item", () => {
    const input = [
      { uuid: "app-1", name: "my-app", status: "running", health_check_enabled: true, config_hash: "abc123" },
    ];
    const result = pickFields(input, ["uuid", "name", "status"]);
    expect(result).toEqual([
      { uuid: "app-1", name: "my-app", status: "running" },
    ]);
  });

  it("should pick deployment fields including deployment_uuid, commit, and finished_at", () => {
    const input = [
      {
        id: 145,
        deployment_uuid: "dep-uuid-1",
        status: "finished",
        commit: "abc123",
        created_at: "2026-03-04T06:31:18.000000Z",
        finished_at: "2026-03-04T06:31:26.000000Z",
        logs: "very long logs...",
        application_id: "5",
      },
    ];
    const result = pickFields(input, ["deployment_uuid", "status", "commit", "created_at", "finished_at"]);
    expect(result).toEqual([
      {
        deployment_uuid: "dep-uuid-1",
        status: "finished",
        commit: "abc123",
        created_at: "2026-03-04T06:31:18.000000Z",
        finished_at: "2026-03-04T06:31:26.000000Z",
      },
    ]);
  });

  it("should omit fields that do not exist on the item", () => {
    const input = [{ uuid: "app-1" }];
    const result = pickFields(input, ["uuid", "name"]);
    expect(result).toEqual([{ uuid: "app-1" }]);
  });
});

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

  it("should register all 12 tools", () => {
    const toolSpy = vi.spyOn(server, "tool");

    registerTools(server, client);

    expect(toolSpy).toHaveBeenCalledTimes(12);

    const registeredNames = toolSpy.mock.calls.map((call) => call[0]);
    expect(registeredNames).toEqual([
      "list_applications",
      "list_services",
      "get_application",
      "get_service",
      "deploy",
      "get_application_logs",
      "list_deployments",
      "list_application_deployments",
      "get_deployment",
      "restart_application",
      "restart_service",
      "list_servers",
    ]);
  });
});
