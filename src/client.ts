export interface CoolifyClientConfig {
  baseUrl: string;
  apiToken: string;
}

export interface DeployOptions {
  uuid?: string;
  tag?: string;
  force?: boolean;
}

export class CoolifyClient {
  private baseUrl: string;
  private apiToken: string;

  constructor(config: CoolifyClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiToken = config.apiToken;
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/v1${path}`, {
      ...options,
      headers: { ...this.headers, ...options?.headers },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Coolify API error: ${response.status} ${response.statusText} - ${body}`,
      );
    }

    return response.json() as Promise<T>;
  }

  async listApplications(): Promise<unknown[]> {
    return this.request<unknown[]>("/applications");
  }

  async listServices(): Promise<unknown[]> {
    return this.request<unknown[]>("/services");
  }

  async getApplication(uuid: string): Promise<unknown> {
    return this.request<unknown>(`/applications/${uuid}`);
  }

  async getService(uuid: string): Promise<unknown> {
    return this.request<unknown>(`/services/${uuid}`);
  }

  async deploy(options: DeployOptions): Promise<unknown> {
    return this.request<unknown>("/deploy", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async getApplicationLogs(uuid: string, lines: number = 100, containerName?: string): Promise<unknown> {
    const params = new URLSearchParams({ lines: String(lines) });
    if (containerName) {
      params.set("container_name", containerName);
    }
    return this.request<unknown>(`/applications/${uuid}/logs?${params}`);
  }

  async listDeployments(): Promise<unknown[]> {
    return this.request<unknown[]>("/deployments");
  }

  async listApplicationDeployments(uuid: string): Promise<unknown[]> {
    const result = await this.request<{ deployments: unknown[] }>(`/deployments/applications/${uuid}`);
    return result.deployments;
  }

  async getDeployment(uuid: string): Promise<unknown> {
    return this.request<unknown>(`/deployments/${uuid}`);
  }

  async restartApplication(uuid: string): Promise<unknown> {
    return this.request<unknown>(`/applications/${uuid}/restart`, {
      method: "POST",
    });
  }

  async restartService(uuid: string): Promise<unknown> {
    return this.request<unknown>(`/services/${uuid}/restart`, {
      method: "POST",
    });
  }

  async listServers(): Promise<unknown[]> {
    return this.request<unknown[]>("/servers");
  }
}
