# Stage 1: Prune workspace using Turborepo
FROM node:22-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune notification-service --docker

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
WORKDIR /app
RUN npm install -g pnpm
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .
COPY tsconfig.json tsconfig.json


# Build the project
RUN npx turbo run build --filter=notification-service

# Prune devDependencies to keep runtime image small
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --prod --frozen-lockfile

# Stage 4: Minimal production runtime image
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeexpress
USER nodeexpress

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/notification-service ./services/notification-service

WORKDIR /app/services/notification-service
EXPOSE 3006
ENV PORT=3006
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
