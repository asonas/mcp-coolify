# mcp-coolify

MCP (Model Context Protocol) server for [Coolify](https://coolify.io/) API.

Enables AI coding assistants like Claude Code to interact with your Coolify instance.

## Setup

```bash
npm install
npm run build
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `COOLIFY_API_TOKEN` | Yes | Coolify API token |
| `COOLIFY_BASE_URL` | Yes | Coolify instance URL (e.g., `https://coolify.example.com`) |

### Claude Code (`~/.claude/settings.json`)

```json
{
  "mcpServers": {
    "coolify": {
      "command": "node",
      "args": ["/path/to/mcp-coolify/build/index.js"],
      "env": {
        "COOLIFY_API_TOKEN": "your-api-token",
        "COOLIFY_BASE_URL": "https://coolify.example.com"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|---|---|
| `list_applications` | List all applications |
| `list_services` | List all services |
| `get_application` | Get application details and status |
| `get_service` | Get service details and status |
| `deploy` | Deploy by UUID or tag |
| `get_application_logs` | Get runtime logs of a running application |
| `list_deployments` | List active deployments |
| `get_deployment` | Get deployment details and build logs |
| `restart_application` | Restart an application |
| `restart_service` | Restart a service |
| `list_servers` | List all servers |

## Development

```bash
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run build       # Build
```

## License

MIT
