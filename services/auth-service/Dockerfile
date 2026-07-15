# Stage 1: Prune workspace using Turborepo
FROM node:22-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune auth-service --docker

# Stage 2: Install dependencies
FROM node:22-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-timeout 600000 && \
    pnpm install --frozen-lockfile

# Stage 3: Build the application
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
RUN npm install -g pnpm
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .
COPY tsconfig.json tsconfig.json


# Generate Prisma Client with cache mount and retry logic
RUN --mount=type=cache,id=prisma,target=/root/.cache/prisma \
    for i in 1 2 3 4 5; do npx turbo run db:generate --filter=auth-service && break || sleep 5; done


# Build the project
RUN npx turbo run build --filter=auth-service

# Prune devDependencies to keep runtime image small
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --prod --frozen-lockfile

# Stage 4: Minimal production runtime image
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeexpress
USER nodeexpress

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/auth-service ./services/auth-service

WORKDIR /app/services/auth-service
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
