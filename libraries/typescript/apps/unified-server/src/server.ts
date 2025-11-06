import 'dotenv/config'
import { createServer } from 'mcp-use/server'
import { http } from 'mcp-use/connectors'
import { getOAuthToken } from './oauth'

async function main() {
  const server = createServer({ name: 'unified-hub' })

  // ---- Context7 (Cloud HTTP) ----
  const ctxUrl = process.env.CONTEXT7_HTTP_URL || 'https://mcp.context7.com/mcp'
  const ctxHeaders: Record<string, string> | undefined = process.env.CONTEXT7_API_KEY
    ? { CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY }
    : undefined
  await server.addRemote('context7', http({ url: ctxUrl, headers: ctxHeaders }))

  // ---- GitHub MCP (official hosted, HTTP, OAuth) ----
  const ghUrl = process.env.GITHUB_MCP_HTTP_URL || 'https://api.githubcopilot.com/mcp/'
  let token = process.env.GITHUB_MCP_OAUTH_TOKEN
  if (!token && process.env.GITHUB_MCP_OAUTH_CLIENT_ID) {
    token = await getOAuthToken({
      clientId: process.env.GITHUB_MCP_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GITHUB_MCP_OAUTH_CLIENT_SECRET,
      scopes: (process.env.GITHUB_MCP_OAUTH_SCOPES || 'repo,workflow,read:org').split(',').map(s => s.trim()).filter(Boolean),
      callbackUrl: process.env.GITHUB_MCP_OAUTH_CALLBACK_URL || 'http://127.0.0.1:8789/callback',
      tokenFile: process.env.GITHUB_MCP_TOKEN_FILE || '.tokens/github-mcp.json'
    })
  }
  const ghHeaders = token ? { Authorization: `Bearer ${token}` } : undefined
  if (!ghHeaders) {
    console.warn('[github] No OAuth token available; requests may be rejected. Set GITHUB_MCP_OAUTH_* env or GITHUB_MCP_OAUTH_TOKEN.')
  }
  await server.addRemote('github', http({ url: ghUrl, headers: ghHeaders }))

  server.enableLogging?.()
  server.serveStdio()
  const port = Number(process.env.UNIFIED_WS_PORT ?? 8777)
  const host = process.env.UNIFIED_WS_HOST ?? '127.0.0.1'
  server.serveWebSocket({ port, host })

  process.on('SIGINT', async () => { await server.close(); process.exit(0) })
  process.on('SIGTERM', async () => { await server.close(); process.exit(0) })
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
