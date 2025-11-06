# syntax=docker/dockerfile:1

# -----------------------------
# Build stage
# -----------------------------
FROM node:20-slim AS build
WORKDIR /app

# Enable pnpm via corepack for reproducibility
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace manifests (INCLUDE LOCKFILE)
# NOTE: this Dockerfile expects build context at repo root
COPY libraries/typescript/pnpm-workspace.yaml ./libraries/typescript/
COPY libraries/typescript/pnpm-lock.yaml ./libraries/typescript/
COPY libraries/typescript/package.json ./libraries/typescript/

# Copy necessary workspaces
COPY libraries/typescript/packages/ ./libraries/typescript/packages/
COPY libraries/typescript/apps/unified-server/ ./libraries/typescript/apps/unified-server/

# Install deps at workspace root using frozen lockfile
WORKDIR /app/libraries/typescript
RUN pnpm install --frozen-lockfile

# Build the unified-server app
RUN pnpm -C apps/unified-server build

# Produce a production-only deployable for the app (prunes dev deps and other workspaces)
# Resulting /out contains package.json, node_modules (prod only), and built files needed to run
RUN pnpm --filter unified-server deploy --prod /out

# -----------------------------
# Runtime stage
# -----------------------------
FROM node:20-slim AS runtime
WORKDIR /app

# Copy only the pruned deployable from build stage
COPY --from=build /out/ ./

ENV NODE_ENV=production
EXPOSE 8777
CMD ["node", "dist/server.js"]
