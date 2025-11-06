# Unified MCP Server (TypeScript)

A unified MCP server that fans in Context7 and GitHub tools, exposing them as a single MCP server over stdio and WebSocket.

## Overview

This server combines:
- **Context7 MCP** - Remote connection via WebSocket
- **GitHub App tools** - Either via remote GitHub MCP or local Octokit integration

All tools are exposed under namespaces: `context7.*` and `github.*`

## Prerequisites

- Node.js 20 or higher
- pnpm 9 or higher
- GitHub App credentials (if using local GitHub tools)

## Installation

From the TypeScript workspace root:

```bash
cd libraries/typescript
pnpm install
```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp libraries/typescript/apps/unified-server/.env.example libraries/typescript/apps/unified-server/.env
   ```

2. Fill in your environment variables:

   **Required:**
   - `CONTEXT7_WS_URL` - WebSocket URL for Context7 MCP server (e.g., `wss://context7.example.com/ws`)

   **GitHub (choose one):**
   - Option A: Use remote GitHub MCP
     - `GITHUB_MCP_WS_URL` - WebSocket URL for GitHub MCP server
   - Option B: Use local GitHub App (recommended)
     - `GITHUB_APP_ID` - Your GitHub App ID
     - `GITHUB_INSTALLATION_ID` - Installation ID for the app
     - `GITHUB_PRIVATE_KEY` - GitHub App private key (PEM format, escaped for env var)

   **Optional:**
   - `UNIFIED_WS_PORT` - WebSocket port (default: 8777)
   - `UNIFIED_WS_HOST` - WebSocket host (default: 127.0.0.1)

## Running

### Development

```bash
cd libraries/typescript/apps/unified-server
pnpm dev
```

### Production

```bash
# Build first
pnpm build

# Then run
pnpm start
```

Or using Docker:

```bash
docker build -t unified-server -f libraries/typescript/apps/unified-server/Dockerfile .
docker run -p 8777:8777 --env-file libraries/typescript/apps/unified-server/.env unified-server
```

## Verification

### Using Inspector

1. Start the server: `pnpm dev`
2. Open Inspector at the configured WebSocket endpoint
3. Verify tools are listed:
   - `context7.*` tools (from remote Context7 MCP)
   - `github.*` tools:
     - `github.add_issue_comment`
     - `github.create_branch`
     - `github.create_pull_request`

### Testing GitHub Tools

Test with a repository your GitHub App has access to:

```bash
# Example: Add a comment to an issue
# Use Inspector or MCP client to call:
# github.add_issue_comment({
#   owner: "your-org",
#   repo: "your-repo",
#   issue_number: 1,
#   body: "Test comment"
# })
```

### Testing Context7 Tools

Connect to Context7 and verify tools are accessible through the unified server.

## Configuration for AI Hosts

### Claude Desktop / Cursor

**stdio connection:**
```json
{
  "mcpServers": {
    "unified-server": {
      "command": "node",
      "args": ["path/to/dist/server.js"],
      "env": {
        "CONTEXT7_WS_URL": "wss://your-context7-host/ws",
        "GITHUB_APP_ID": "123456",
        "GITHUB_INSTALLATION_ID": "987654321",
        "GITHUB_PRIVATE_KEY": "-----BEGIN RSA PRIVATE KEY-----\\n...\\n-----END RSA PRIVATE KEY-----"
      }
    }
  }
}
```

**WebSocket connection:**
```json
{
  "mcpServers": {
    "unified-server": {
      "url": "ws://127.0.0.1:8777"
    }
  }
}
```

## Troubleshooting

### Server fails to start

- Check that all required environment variables are set
- Verify `CONTEXT7_WS_URL` is accessible
- Ensure GitHub credentials are valid if using local GitHub App

### Tools not appearing

- Check server logs for connection errors
- Verify Context7 MCP is reachable
- For GitHub tools, ensure GitHub App has necessary permissions

### Connection timeouts

- Check network connectivity to Context7
- Verify WebSocket URL format (should start with `wss://` or `ws://`)
- Review firewall settings

## Architecture

```
┌─────────────────┐
│  AI Client      │
│  (Claude/Cursor)│
└────────┬────────┘
         │
         │ stdio / WebSocket
         │
┌────────▼──────────────────┐
│  Unified Server            │
│  (unified-server)          │
├────────────────────────────┤
│  • Context7 Remote        │
│  • GitHub Tools (local)    │
│    or GitHub MCP (remote) │
└────────────────────────────┘
         │
         ├──► Context7 MCP (WebSocket)
         └──► GitHub MCP (optional WebSocket)
```

## Next Steps

- [ ] Add metrics endpoint (Prometheus)
- [ ] Add request IDs for tracing
- [ ] Implement retry logic for remote calls
- [ ] Add input validation beyond JSON schema

## Related

- See [PR #1](../../../../../pull/1) for the full epic tracking
- Inspector documentation: [docs/inspector/](../../../../docs/inspector/)

