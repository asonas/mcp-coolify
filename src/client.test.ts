import { describe, it, expect, vi, beforeEach } from "vitest";
import { CoolifyClient } from "./client.js";

function mockFetch(response: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(response),
  });
}

describe("CoolifyClient", () => {
  let client: CoolifyClient;

  beforeEach(() => {
    client = new CoolifyClient({
      baseUrl: "https://coolify.example.com",
      apiToken: "test-token",
    });
  });

  const expectedHeaders = {
    headers: {
      Authorization: "Bearer test-token",
      "Content-Type": "application/json",
    },
  };

  describe("listApplications", () => {
    it("should fetch applications list", async () => {
      const mockResponse = [
        { uuid: "app-1", name: "my-app", status: "running" },
      ];
      mockFetch(mockResponse);

      const result = await client.listApplications();

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/applications",
        expectedHeaders,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("listServices", () => {
    it("should fetch services list", async () => {
      const mockResponse = [
        { uuid: "svc-1", name: "my-service", status: "running" },
      ];
      mockFetch(mockResponse);

      const result = await client.listServices();

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/services",
        expectedHeaders,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getApplication", () => {
    it("should fetch a single application by uuid", async () => {
      const mockResponse = {
        uuid: "app-1",
        name: "my-app",
        status: "running",
      };
      mockFetch(mockResponse);

      const result = await client.getApplication("app-1");

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/applications/app-1",
        expectedHeaders,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getService", () => {
    it("should fetch a single service by uuid", async () => {
      const mockResponse = {
        uuid: "svc-1",
        name: "my-service",
        status: "running",
      };
      mockFetch(mockResponse);

      const result = await client.getService("svc-1");

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/services/svc-1",
        expectedHeaders,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deploy", () => {
    it("should deploy by uuid", async () => {
      const mockResponse = {
        deployments: [
          {
            message: "Deployment queued.",
            resource_uuid: "app-1",
            deployment_uuid: "dep-1",
          },
        ],
      };
      mockFetch(mockResponse);

      const result = await client.deploy({ uuid: "app-1" });

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/deploy",
        {
          ...expectedHeaders,
          method: "POST",
          body: JSON.stringify({ uuid: "app-1" }),
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it("should deploy with force option", async () => {
      const mockResponse = { deployments: [] };
      mockFetch(mockResponse);

      await client.deploy({ uuid: "app-1", force: true });

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/deploy",
        {
          ...expectedHeaders,
          method: "POST",
          body: JSON.stringify({ uuid: "app-1", force: true }),
        },
      );
    });

    it("should deploy by tag", async () => {
      const mockResponse = { deployments: [] };
      mockFetch(mockResponse);

      await client.deploy({ tag: "production" });

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/deploy",
        {
          ...expectedHeaders,
          method: "POST",
          body: JSON.stringify({ tag: "production" }),
        },
      );
    });
  });

  describe("getApplicationLogs", () => {
    it("should fetch application logs with default lines", async () => {
      const mockResponse = { logs: "Server started on port 3000\n" };
      mockFetch(mockResponse);

      const result = await client.getApplicationLogs("app-1");

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/applications/app-1/logs?lines=100",
        expectedHeaders,
      );
      expect(result).toEqual(mockResponse);
    });

    it("should fetch application logs with custom lines", async () => {
      const mockResponse = { logs: "line1\nline2\n" };
      mockFetch(mockResponse);

      await client.getApplicationLogs("app-1", 50);

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/applications/app-1/logs?lines=50",
        expectedHeaders,
      );
    });
  });

  describe("listDeployments", () => {
    it("should fetch active deployments", async () => {
      const mockResponse = [
        { uuid: "dep-1", status: "in_progress" },
      ];
      mockFetch(mockResponse);

      const result = await client.listDeployments();

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/deployments",
        expectedHeaders,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("listApplicationDeployments", () => {
    it("should fetch deployment history for a specific application", async () => {
      const mockResponse = [
        { uuid: "dep-1", status: "finished", created_at: "2026-02-26T13:35:00Z" },
        { uuid: "dep-2", status: "failed", created_at: "2026-02-26T12:00:00Z" },
      ];
      mockFetch(mockResponse);

      const result = await client.listApplicationDeployments("app-1");

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/deployments/applications/app-1",
        expectedHeaders,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getDeployment", () => {
    it("should fetch deployment details including logs", async () => {
      const mockResponse = {
        uuid: "dep-1",
        status: "finished",
        logs: "Build completed successfully",
      };
      mockFetch(mockResponse);

      const result = await client.getDeployment("dep-1");

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/deployments/dep-1",
        expectedHeaders,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("restartApplication", () => {
    it("should restart an application", async () => {
      const mockResponse = {
        message: "Restart request queued.",
        deployment_uuid: "dep-2",
      };
      mockFetch(mockResponse);

      const result = await client.restartApplication("app-1");

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/applications/app-1/restart",
        { ...expectedHeaders, method: "POST" },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("restartService", () => {
    it("should restart a service", async () => {
      const mockResponse = {
        message: "Service restarting request queued.",
      };
      mockFetch(mockResponse);

      const result = await client.restartService("svc-1");

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/services/svc-1/restart",
        { ...expectedHeaders, method: "POST" },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("listServers", () => {
    it("should fetch servers list", async () => {
      const mockResponse = [
        { uuid: "srv-1", name: "production", ip: "192.168.1.1" },
      ];
      mockFetch(mockResponse);

      const result = await client.listServers();

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/servers",
        expectedHeaders,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("error handling", () => {
    it("should throw on non-ok response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: () => Promise.resolve("Invalid token"),
      });

      await expect(client.listApplications()).rejects.toThrow(
        "Coolify API error: 401 Unauthorized - Invalid token",
      );
    });
  });

  describe("baseUrl trailing slash", () => {
    it("should strip trailing slashes from baseUrl", async () => {
      const clientWithSlash = new CoolifyClient({
        baseUrl: "https://coolify.example.com/",
        apiToken: "test-token",
      });
      mockFetch([]);

      await clientWithSlash.listApplications();

      expect(fetch).toHaveBeenCalledWith(
        "https://coolify.example.com/api/v1/applications",
        expectedHeaders,
      );
    });
  });
});
