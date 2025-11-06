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
      handler: async (input: { owner: string; repo: string; issue_number: number; body: string }) => {
        try {
          const o = await getOctokit()
          const res = await o.issues.createComment(input)
          return { ok: true, id: res.data.id, html_url: res.data.html_url }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          const wrapped = new Error(`Failed to add issue comment: ${message}`)
          if (error instanceof Error) {
            wrapped.cause = error
            wrapped.stack = error.stack
          }
          throw wrapped
        }
      }
    },
    create_branch: {
      description: 'Create a new branch from an existing ref',
      inputSchema: {
        type: 'object',
        properties: { owner: { type: 'string' }, repo: { type: 'string' }, new_branch: { type: 'string' }, from_ref: { type: 'string' } },
        required: ['owner','repo','new_branch','from_ref']
      },
      handler: async (input: { owner: string; repo: string; new_branch: string; from_ref: string }) => {
        try {
          const o = await getOctokit()
          const base = await o.git.getRef({ owner: input.owner, repo: input.repo, ref: `heads/${input.from_ref}` })
          await o.git.createRef({ owner: input.owner, repo: input.repo, ref: `refs/heads/${input.new_branch}`, sha: base.data.object.sha })
          return { ok: true }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          const wrapped = new Error(`Failed to create branch: ${message}`)
          if (error instanceof Error) {
            wrapped.cause = error
            wrapped.stack = error.stack
          }
          throw wrapped
        }
      }
    },
    create_pull_request: {
      description: 'Create a pull request',
      inputSchema: {
        type: 'object',
        properties: { owner: { type: 'string' }, repo: { type: 'string' }, title: { type: 'string' }, head: { type: 'string' }, base: { type: 'string' }, body: { type: 'string' } },
        required: ['owner','repo','title','head','base']
      },
      handler: async (input: { owner: string; repo: string; title: string; head: string; base: string; body?: string }) => {
        try {
          const o = await getOctokit()
          const res = await o.pulls.create(input)
          return { ok: true, number: res.data.number, html_url: res.data.html_url }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          const wrapped = new Error(`Failed to create pull request: ${message}`)
          if (error instanceof Error) {
            wrapped.cause = error
            wrapped.stack = error.stack
          }
          throw wrapped
        }
      }
    }
  }
}
