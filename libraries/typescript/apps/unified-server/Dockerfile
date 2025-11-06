# syntax=docker/dockerfile:1

# Build & run unified MCP (TS) from workspace
FROM node:20-slim
WORKDIR /app

# Use pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# --- Copy workspace manifests (IMPORTANT: include pnpm-lock.yaml) ---
# Expect build context at libraries/typescript/ (workspace root)
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy monorepo workspaces
COPY packages ./packages
COPY apps ./apps

# Install dependencies using the lockfile
RUN pnpm install --frozen-lockfile

# Build only the unified server app
RUN pnpm -C apps/unified-server build

ENV NODE_ENV=production
EXPOSE 8777
CMD ["node", "apps/unified-server/dist/server.js"]
