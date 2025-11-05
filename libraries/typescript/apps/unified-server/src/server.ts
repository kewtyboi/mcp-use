import 'dotenv/config'
import { createServer } from 'mcp-use/server'
import { websocket, stdio } from 'mcp-use/connectors'
import { createGitHubOctokit, githubToolHandlers } from './github-tools'

async function main() {
  const server = createServer({ name: 'unified-hub' })

  const ctx7Url = process.env.CONTEXT7_WS_URL
  if (!ctx7Url) throw new Error('CONTEXT7_WS_URL not set')
  await server.addRemote('context7', websocket({ url: ctx7Url }))

  if (process.env.GITHUB_MCP_WS_URL) {
    await server.addRemote('github', websocket({ url: process.env.GITHUB_MCP_WS_URL! }))
  } else {
    const appId = process.env.GITHUB_APP_ID
    const privateKey = process.env.GITHUB_PRIVATE_KEY
    const installationId = process.env.GITHUB_INSTALLATION_ID

    if (!appId) throw new Error('GITHUB_APP_ID is required when GITHUB_MCP_WS_URL is not set')
    if (!privateKey) throw new Error('GITHUB_PRIVATE_KEY is required when GITHUB_MCP_WS_URL is not set')
    if (!installationId) throw new Error('GITHUB_INSTALLATION_ID is required when GITHUB_MCP_WS_URL is not set')

    const getOctokit = createGitHubOctokit({
      appId,
      privateKey,
      installationId
    })
    const gh = githubToolHandlers(getOctokit)
    server.tools.registerNamespace('github', {
      add_issue_comment: server.tools.wrap(gh.add_issue_comment),
      create_branch: server.tools.wrap(gh.create_branch),
      create_pull_request: server.tools.wrap(gh.create_pull_request)
    })
  }

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
