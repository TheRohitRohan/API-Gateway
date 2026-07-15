# ---------- Stage 1: Prune workspace ----------
FROM node:22-alpine AS pruner

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g turbo

COPY . .

RUN turbo prune gateway --docker

# ---------- Stage 2: Install dependencies ----------
FROM node:22-alpine AS installer

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g pnpm

COPY --from=pruner /app/out/json/ .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

# ---------- Stage 3: Build ----------
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .

RUN npx turbo run build --filter=gateway

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --prod --frozen-lockfile

# ---------- Stage 4: Runtime ----------
FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 gateway

USER gateway

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/gateway ./apps/gateway

WORKDIR /app/apps/gateway

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]