import http from 'http'
import { parse } from 'url'
import { randomBytes } from 'crypto'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

export type OAuthConfig = {
  clientId: string
  clientSecret?: string
  scopes: string[]
  callbackUrl: string
  tokenFile: string
}

export async function getOAuthToken(cfg: OAuthConfig): Promise<string> {
  // 1) Try cached token first
  const existing = await readToken(cfg.tokenFile)
  if (existing?.access_token) return existing.access_token

  // 2) Run redirect flow to obtain a token
  const token = await runRedirectFlow(cfg)
  await writeToken(cfg.tokenFile, token)
  return token.access_token
}

async function runRedirectFlow(cfg: OAuthConfig): Promise<{ access_token: string; token_type: string; scope?: string }>{
  const state = randomBytes(16).toString('hex')
  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', cfg.clientId)
  authorize.searchParams.set('redirect_uri', cfg.callbackUrl)
  authorize.searchParams.set('scope', cfg.scopes.join(' '))
  authorize.searchParams.set('state', state)

  const { server, gotCode } = await listenForCallback(cfg.callbackUrl, state)
  try {
    await openInBrowser(authorize.toString())
    const code = await gotCode
    const token = await exchangeCodeForToken({
      clientId: cfg.clientId,
      clientSecret: cfg.clientSecret,
      code,
      redirectUri: cfg.callbackUrl
    })
    return token
  } finally {
    server.close()
  }
}

async function exchangeCodeForToken(params: { clientId: string; clientSecret?: string; code: string; redirectUri: string }) {
  const body = new URLSearchParams({
    client_id: params.clientId,
    code: params.code,
    redirect_uri: params.redirectUri
  })
  if (params.clientSecret) body.set('client_secret', params.clientSecret)

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub OAuth token exchange failed: ${res.status} ${text}`)
  }
  const json = await res.json() as any
  if (!json.access_token) throw new Error('No access_token in GitHub OAuth response')
  return json as { access_token: string; token_type: string; scope?: string }
}

function listenForCallback(callbackUrl: string, expectedState: string) {
  const cb = new URL(callbackUrl)
  const port = Number(cb.port || 80)
  const pathname = cb.pathname

  let resolveCode: (code: string) => void
  let rejectCode: (err: any) => void
  const gotCode = new Promise<string>((resolve, reject) => { resolveCode = resolve; rejectCode = reject })

  const server = http.createServer((req, res) => {
    const url = parse(req.url || '', true)
    if (req.method === 'GET' && url.pathname === pathname) {
      const code = url.query.code as string | undefined
      const state = url.query.state as string | undefined
      if (!code || !state || state !== expectedState) {
        res.statusCode = 400
        res.end('Invalid OAuth response')
        return
      }
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end('<p>✅ GitHub OAuth complete. You can close this tab.</p>')
      resolveCode(code)
    } else {
      res.statusCode = 404
      res.end('Not found')
    }
  })
  server.listen(port, cb.hostname, () => {
    // ready
  })
  return { server, gotCode }
}

async function readToken(file: string): Promise<{ access_token: string } | null> {
  try {
    const content = await fs.readFile(file, 'utf8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

async function writeToken(file: string, token: any) {
  const dir = path.dirname(file)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(file, JSON.stringify(token, null, 2), 'utf8')
}

async function openInBrowser(url: string) {
  const commands = process.platform === 'win32'
    ? ['cmd', ['/c', 'start', '', url]]
    : process.platform === 'darwin'
      ? ['open', [url]]
      : ['xdg-open', [url]]
  try {
    spawn(commands[0], commands[1], { stdio: 'ignore', detached: true })
  } catch {
    console.log(`
Please open this URL to authorize GitHub: ${url}
`)
  }
}
