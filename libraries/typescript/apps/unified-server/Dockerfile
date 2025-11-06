# syntax=docker/dockerfile:1.7-labs

# -----------------------------
# Build stage
# -----------------------------
FROM node:20-slim AS build
WORKDIR /app

# Use pnpm via corepack and define a stable store path for cache mounts
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
ENV PNPM_STORE_DIR=/pnpm/store

# Copy workspace manifests (INCLUDE LOCKFILE)
# NOTE: this Dockerfile expects build context at repo root
COPY libraries/typescript/pnpm-workspace.yaml ./libraries/typescript/
COPY libraries/typescript/pnpm-lock.yaml ./libraries/typescript/
COPY libraries/typescript/package.json ./libraries/typescript/

# Copy necessary workspaces
COPY libraries/typescript/packages/ ./libraries/typescript/packages/
COPY libraries/typescript/apps/unified-server/ ./libraries/typescript/apps/unified-server/

# Install deps at workspace root using frozen lockfile with cache mount
WORKDIR /app/libraries/typescript
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

# Build the unified-server app (reuse the same cache)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm -C apps/unified-server build

# Produce a production-only deployable for the app (prunes dev deps & other workspaces)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm --filter unified-server deploy --prod /out

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
