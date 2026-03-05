import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CoolifyClient } from "./client.js";

export function pickFields(
  items: unknown[],
  fields: string[],
): Record<string, unknown>[] {
  return items.map((item) => {
    const record = item as Record<string, unknown>;
    const picked: Record<string, unknown> = {};
    for (const field of fields) {
      if (field in record) {
        picked[field] = record[field];
      }
    }
    return picked;
  });
}

export function registerTools(server: McpServer, client: CoolifyClient): void {
  server.tool(
    "list_applications",
    "List all applications managed by Coolify",
    {},
    async () => {
      const apps = await client.listApplications();
      const summary = pickFields(apps, ["uuid", "name", "status", "fqdn", "description"]);
      return {
        content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      };
    },
  );

  server.tool(
    "list_services",
    "List all services managed by Coolify",
    {},
    async () => {
      const services = await client.listServices();
      const summary = pickFields(services, ["uuid", "name", "status", "type", "description"]);
      return {
        content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      };
    },
  );

  server.tool(
    "get_application",
    "Get details and status of a specific application",
    { uuid: z.string().describe("Application UUID") },
    async ({ uuid }) => {
      const app = await client.getApplication(uuid);
      return {
        content: [{ type: "text", text: JSON.stringify(app, null, 2) }],
      };
    },
  );

  server.tool(
    "get_service",
    "Get details and status of a specific service",
    { uuid: z.string().describe("Service UUID") },
    async ({ uuid }) => {
      const service = await client.getService(uuid);
      return {
        content: [{ type: "text", text: JSON.stringify(service, null, 2) }],
      };
    },
  );

  server.tool(
    "deploy",
    "Deploy an application or service. Specify either uuid or tag, not both.",
    {
      uuid: z
        .string()
        .optional()
        .describe("Resource UUID (comma-separated for multiple)"),
      tag: z
        .string()
        .optional()
        .describe("Tag name (comma-separated for multiple)"),
      force: z
        .boolean()
        .optional()
        .describe("Force rebuild without cache"),
    },
    async ({ uuid, tag, force }) => {
      const result = await client.deploy({ uuid, tag, force });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_application_logs",
    "Get runtime logs of a running application",
    {
      uuid: z.string().describe("Application UUID"),
      lines: z
        .number()
        .optional()
        .describe("Number of log lines to retrieve (default: 100)"),
    },
    async ({ uuid, lines }) => {
      const result = await client.getApplicationLogs(uuid, lines);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "list_deployments",
    "List currently active deployments (in_progress or queued)",
    {},
    async () => {
      const deployments = await client.listDeployments();
      const summary = pickFields(deployments, ["deployment_uuid", "status", "commit", "created_at", "finished_at"]);
      return {
        content: [
          { type: "text", text: JSON.stringify(summary, null, 2) },
        ],
      };
    },
  );

  server.tool(
    "list_application_deployments",
    "List deployment history for a specific application (includes past deployments, not just active ones)",
    { uuid: z.string().describe("Application UUID") },
    async ({ uuid }) => {
      const deployments = await client.listApplicationDeployments(uuid);
      const summary = pickFields(deployments, ["deployment_uuid", "status", "commit", "created_at", "finished_at"]);
      return {
        content: [
          { type: "text", text: JSON.stringify(summary, null, 2) },
        ],
      };
    },
  );

  server.tool(
    "get_deployment",
    "Get deployment details including build logs",
    { uuid: z.string().describe("Deployment UUID") },
    async ({ uuid }) => {
      const deployment = await client.getDeployment(uuid);
      return {
        content: [
          { type: "text", text: JSON.stringify(deployment, null, 2) },
        ],
      };
    },
  );

  server.tool(
    "restart_application",
    "Restart an application",
    { uuid: z.string().describe("Application UUID") },
    async ({ uuid }) => {
      const result = await client.restartApplication(uuid);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "restart_service",
    "Restart a service",
    { uuid: z.string().describe("Service UUID") },
    async ({ uuid }) => {
      const result = await client.restartService(uuid);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "list_servers",
    "List all servers connected to Coolify",
    {},
    async () => {
      const servers = await client.listServers();
      const summary = pickFields(servers, ["uuid", "name", "ip", "status"]);
      return {
        content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      };
    },
  );
}
