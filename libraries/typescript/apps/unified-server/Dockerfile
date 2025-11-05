# Multi-stage build for unified-server
FROM node:20-slim AS base

# Install pnpm
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy workspace configuration
COPY libraries/typescript/pnpm-workspace.yaml libraries/typescript/package.json libraries/typescript/.npmrc* ./libraries/typescript/ 2>/dev/null || true

# Copy mcp-use package (needed for workspace dependency)
COPY libraries/typescript/packages/mcp-use ./libraries/typescript/packages/mcp-use

# Copy unified-server app
COPY libraries/typescript/apps/unified-server ./libraries/typescript/apps/unified-server

# Install dependencies and build
WORKDIR /app/libraries/typescript
RUN pnpm install --frozen-lockfile
RUN pnpm --filter unified-server build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Copy built application
COPY --from=base /app/libraries/typescript/apps/unified-server/dist ./dist
COPY --from=base /app/libraries/typescript/apps/unified-server/package.json ./
COPY --from=base /app/libraries/typescript/node_modules ./node_modules

# Expose WebSocket port (default 8777)
EXPOSE 8777

# Run the server
CMD ["node", "dist/server.js"]

