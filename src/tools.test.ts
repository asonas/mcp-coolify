import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CoolifyClient } from "./client.js";
import { registerTools, pickFields, truncateDeploymentLogs } from "./tools.js";

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

describe("truncateDeploymentLogs", () => {
  it("should parse logs JSON string and return last N entries", () => {
    
    const logsJson = JSON.stringify([
      { output: "Step 1", timestamp: "2026-03-06T09:43:15.000Z" },
      { output: "Step 2", timestamp: "2026-03-06T09:43:16.000Z" },
      { output: "Step 3", timestamp: "2026-03-06T09:43:17.000Z" },
      { output: "Step 4", timestamp: "2026-03-06T09:43:18.000Z" },
      { output: "Step 5", timestamp: "2026-03-06T09:43:19.000Z" },
    ]);
    const result = truncateDeploymentLogs(logsJson, 3);
    expect(result).toEqual([
      { output: "Step 3", timestamp: "2026-03-06T09:43:17.000Z" },
      { output: "Step 4", timestamp: "2026-03-06T09:43:18.000Z" },
      { output: "Step 5", timestamp: "2026-03-06T09:43:19.000Z" },
    ]);
  });

  it("should return all entries when lines exceeds array length", () => {
    
    const logsJson = JSON.stringify([
      { output: "Step 1", timestamp: "2026-03-06T09:43:15.000Z" },
    ]);
    const result = truncateDeploymentLogs(logsJson, 50);
    expect(result).toEqual([
      { output: "Step 1", timestamp: "2026-03-06T09:43:15.000Z" },
    ]);
  });

  it("should return empty array for invalid JSON", () => {
    
    const result = truncateDeploymentLogs("not valid json", 10);
    expect(result).toEqual([]);
  });

  it("should default to 100 lines when lines is not specified", () => {
    
    const entries = Array.from({ length: 150 }, (_, i) => ({
      output: `Step ${i}`,
      timestamp: "2026-03-06T09:43:15.000Z",
    }));
    const logsJson = JSON.stringify(entries);
    const result = truncateDeploymentLogs(logsJson);
    expect(result).toHaveLength(100);
    expect((result[0] as Record<string, unknown>).output).toBe("Step 50");
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

  it("should register all 13 tools", () => {
    const toolSpy = vi.spyOn(server, "tool");

    registerTools(server, client);

    expect(toolSpy).toHaveBeenCalledTimes(13);

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
      "get_deployment_logs",
      "restart_application",
      "restart_service",
      "list_servers",
    ]);
  });
});
