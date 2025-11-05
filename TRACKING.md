# Epic: TS unified MCP server – Context 7 + GitHub App (Option A)

> Issues are disabled in this repository. This tracking file holds the full issue breakdown so an AI agent (or a human) can execute the plan end-to-end. If issues get enabled later, copy each section into a standalone issue.

---

## [1] Workspace: create apps/unified-server and wire workspace

**Goal**: Create a new app at `libraries/typescript/apps/unified-server` that depends on the local `packages/mcp-use` workspace.

**Steps**
- Edit `libraries/typescript/pnpm-workspace.yaml` and include `apps/*`.
- Create directory structure: `libraries/typescript/apps/unified-server/{package.json, tsconfig.json, .env.example, src/}`.
- package.json (ESM) with scripts: dev (tsx), build (tsc), start (node dist).
- Dependencies: `@octokit/app`, `@octokit/auth-app`, `@octokit/rest`, `dotenv`, `mcp-use@workspace:*`.
- Dev deps: `tsx`, `typescript`, `@types/node`.
- tsconfig: target/module ES2022, moduleResolution Bundler, outDir dist, rootDir src, strict true.
- Run `pnpm i` at `libraries/typescript/`.

**Acceptance Criteria**
- New app resolves `mcp-use` via workspace and compiles with `pnpm build`.

---

## [2] GitHub App wrapper tools (src/github-tools.ts)

**Goal**: Wrap GitHub App using Octokit and expose tools: `add_issue_comment`, `create_branch`, `create_pull_request`.

**File**: `libraries/typescript/apps/unified-server/src/github-tools.ts`

**Template**
- Implement a factory `createGitHubOctokit({ appId, installationId, privateKey })` returning an async getter producing an installation-scoped Octokit client.
- Implement `githubToolHandlers(getOctokit)` that returns three entries:
  - add_issue_comment(owner, repo, issue_number, body) → POST comment; return `{ ok, id, html_url }`.
  - create_branch(owner, repo, new_branch, from_ref) → read `git.getRef('heads/'+from_ref)`; `git.createRef('refs/heads/'+new_branch, sha)`; return `{ ok }`.
  - create_pull_request(owner, repo, title, head, base, body?) → `pulls.create`; return `{ ok, number, html_url }`.
- Provide `inputSchema` for each tool as JSON Schema objects.
- Handle Octokit errors and surface concise messages.

**Acceptance Criteria**
- Each tool returns stable JSON with only needed fields.
- (Optional) minimal unit tests for happy/failure paths.

---

## [3] Env & secrets (.env.example)

**Goal**: Provide example envs and load via `dotenv`.

**File**: `libraries/typescript/apps/unified-server/.env.example`

**Contents**
- CONTEXT7_WS_URL=wss://your-context7-host.example/ws
- UNIFIED_WS_PORT=8777
- UNIFIED_WS_HOST=127.0.0.1
- GITHUB_APP_ID=123456
- GITHUB_INSTALLATION_ID=987654321
- GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
- (Optional) GITHUB_MCP_WS_URL=wss://github-mcp.example/ws

**Acceptance Criteria**
- App boots with `dotenv/config` and fails fast when required vars are missing.

---

## [4] Unified server entrypoint (src/server.ts)

**Goal**: Compose Context 7 remote + GitHub tools and expose stdio + WebSocket.

**File**: `libraries/typescript/apps/unified-server/src/server.ts`

**Implementation outline**
- Import from `mcp-use/server` and `mcp-use/connectors`.
- Create server with `{ name: 'unified-hub' }`.
- Attach Context 7 via `websocket({ url: process.env.CONTEXT7_WS_URL })`. If stdio-only, use `stdio({ command, args, env })`.
- If `GITHUB_MCP_WS_URL` present → `addRemote('github', websocket({ url }))`. Else register local tools under `github` namespace using handlers from [2].
- Enable logging if available.
- `serveStdio()` and `serveWebSocket({ port, host })`.
- Add SIGINT/SIGTERM handlers to close gracefully.

**Acceptance Criteria**
- Server logs show successful remote attach; stdio + WS listening.
- Tool list shows `context7.*` and `github.*`.

---

## [5] Local run & verification

**Steps**
- `cd libraries/typescript/apps/unified-server && pnpm dev`.
- Use **Inspector** (docs/inspector) to enumerate tools and make sample calls.
- Test `github.add_issue_comment` against a repo in the App installation.
- Test a Context 7 tool via the remote.
- Configure host (Claude/Cursor) to use stdio (`node dist/server.js`) or WS (`ws://127.0.0.1:8777`).

**Acceptance Criteria**
- Both tool sets callable and return expected results.

---

## [6] Dockerization

**Goal**: Provide a simple container image for the unified server.

**File**: `libraries/typescript/apps/unified-server/Dockerfile`

**Template**
- Use `node:20-slim`.
- Install with pnpm and build app (`pnpm build`).
- `CMD node dist/server.js`.
- For monorepo, consider a multi-stage build at workspace root to include `mcp-use` package.

**Acceptance Criteria**
- `docker build` succeeds; container runs with envs and exposes WS port.

---

## [7] Hardening

**Checklist**
- Validate inputs beyond JSON schema as needed.
- Timeouts/retries on remote Context 7 calls.
- Mask secrets in logs.
- (Optional) Prometheus metrics endpoint; per-tool timing + request IDs.

---

## [8] Minimal docs

**Files**
- Add a short page to the docs tree: "Unified MCP server (TS)" with env variables, run commands, and Inspector/host verification steps.

**Acceptance Criteria**
- A new user can set env, run the server, and verify tools in under 10 minutes.
