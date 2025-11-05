# Epic: TS unified MCP server – Context 7 + GitHub App (Option A)

> Issues are disabled in this repository. This tracking file holds the full issue breakdown so an AI agent (or a human) can execute the plan end-to-end. If you later enable Issues, lift each section into a standalone issue.

---

## [1] Workspace: create apps/unified-server and wire workspace

**Goal**: Create a new app at libraries/typescript/apps/unified-server that depends on the local packages/mcp-use workspace.

**Steps**
1. Workspace: Edit libraries/typescript/pnpm-workspace.yaml and include "apps/*".
2. Scaffold: Create directory structure: libraries/typescript/apps/unified-server/{package.json, tsconfig.json, .env.example, src/}.
3. package.json (ESM):
```json
{
  "name": "unified-server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@octokit/app": "^14.0.0",
    "@octokit/auth-app": "^7.0.0",
    "@octokit/rest": "^21.0.0",
    "dotenv": "^16.4.5",
    "mcp-use": "workspace:*"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "@types/node": "^20.14.0"
  }
}
```
4. tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```
5. .env.example: see Section [3].
6. Run pnpm i at libraries/typescript/.

**Acceptance Criteria**
- New app resolves mcp-use via workspace and compiles with pnpm build.

---

## [2] GitHub App wrapper tools (src/github-tools.ts)

**Goal**: Wrap GitHub App using Octokit and expose tools: add_issue_comment, create_branch, create_pull_request.

File: libraries/typescript/apps/unified-server/src/github-tools.ts

Implementation (template):
```ts
import { App } from '@octokit/app'
import { Octokit } from '@octokit/rest'

type GitHubEnv = { appId: string; installationId: string; privateKey: string }
export function createGitHubOctokit(env: GitHubEnv) {
  const app = new App({ appId: env.appId, privateKey: env.privateKey })
  return async () => app.getInstallationOctokit(Number(env.installationId))
}
export function githubToolHandlers(getOctokit: () => Promise<Octokit>) {
  return {
    add_issue_comment: {
      description: 'Add a comment to an issue or PR',
      inputSchema: {
        type: 'object',
        properties: { owner: { type: 'string' }, repo: { type: 'string' }, issue_number: { type: 'number' }, body: { type: 'string' } },
        required: ['owner','repo','issue_number','body']
      },
      handler: async (input) => {
        const o = await getOctokit()
        const res = await o.issues.createComment(input)
        return { ok: true, id: res.data.id, html_url: res.data.html_url }
      }
    },
    create_branch: {
      description: 'Create a new branch from an existing ref',
      inputSchema: {
        type: 'object',
        properties: { owner: { type: 'string' }, repo: { type: 'string' }, new_branch: { type: 'string' }, from_ref: { type: 'string' } },
        required: ['owner','repo','new_branch','from_ref']
      },
      handler: async (input) => {
        const o = await getOctokit()
        const base = await o.git.getRef({ owner: input.owner, repo: input.repo, ref: `heads/${input.from_ref}` })
        await o.git.createRef({ owner: input.owner, repo: input.repo, ref: `refs/heads/${input.new_branch}`, sha: base.data.object.sha })
        return { ok: true }
      }
    },
    create_pull_request: {
      description: 'Create a pull request',
      inputSchema: {
        type: 'object',
        properties: { owner: { type: 'string' }, repo: { type: 'string' }, title: { type: 'string' }, head: { type: 'string' }, base: { type: 'string' }, body: { type: 'string' } },
        required: ['owner','repo','title','head','base']
      },
      handler: async (input) => {
        const o = await getOctokit()
        const res = await o.pulls.create(input)
        return { ok: true, number: res.data.number, html_url: res.data.html_url }
      }
    }
  }
}
```

Acceptance Criteria
- Handlers return stable JSON payloads and helpful errors.

---

## [3] Env & secrets (.env.example)

File: libraries/typescript/apps/unified-server/.env.example

``