FROM node:22-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY pnpm-workspace.yaml package.json turbo.json pnpm-lock.yaml tsconfig.json eslint.config.js .prettierrc .eslintrc.json ./
COPY packages/ ./packages/
COPY services/notification-service/ ./services/notification-service/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @microservices-demo/shared-types build
RUN pnpm --filter @microservices-demo/shared-utils build
WORKDIR /app/services/notification-service
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/notification-service ./services/notification-service
WORKDIR /app/services/notification-service
EXPOSE 3006
ENV PORT=3006
CMD ["node", "dist/index.js"]
