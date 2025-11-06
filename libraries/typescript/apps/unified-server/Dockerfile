# Multi-stage build for unified-server
# Build context: Run `docker build` from repository root
# Example: docker build -t unified-server -f libraries/typescript/apps/unified-server/Dockerfile .
FROM node:20-slim AS base

# Install pnpm (pinned version for reproducibility)
ARG PNPM_VERSION=9.15.0
RUN npm install -g pnpm@${PNPM_VERSION}

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

# Create non-root user for security
RUN groupadd -r mcpuser && useradd -r -g mcpuser mcpuser

WORKDIR /app

# Copy built application and workspace files needed for production install
COPY --from=base /app/libraries/typescript/apps/unified-server/dist ./dist
COPY --from=base /app/libraries/typescript/pnpm-workspace.yaml ./libraries/typescript/
COPY --from=base /app/libraries/typescript/package.json ./libraries/typescript/
COPY --from=base /app/libraries/typescript/pnpm-lock.yaml ./libraries/typescript/ 2>/dev/null || true
COPY --from=base /app/libraries/typescript/apps/unified-server/package.json ./libraries/typescript/apps/unified-server/
COPY --from=base /app/libraries/typescript/packages/mcp-use/package.json ./libraries/typescript/packages/mcp-use/
COPY --from=base /app/libraries/typescript/packages/mcp-use/dist ./libraries/typescript/packages/mcp-use/dist

# Install pnpm for production stage
ARG PNPM_VERSION=9.15.0
RUN npm install -g pnpm@${PNPM_VERSION}

# Install only production dependencies (this excludes dev dependencies like tsx, typescript)
WORKDIR /app/libraries/typescript
RUN pnpm install --prod --frozen-lockfile --filter unified-server

WORKDIR /app

# Change ownership to non-root user
RUN chown -R mcpuser:mcpuser /app

# Switch to non-root user
USER mcpuser

# Expose WebSocket port (default 8777)
EXPOSE 8777

# Run the server
CMD ["node", "dist/server.js"]

