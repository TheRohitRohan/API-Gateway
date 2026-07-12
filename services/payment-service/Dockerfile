FROM node:22-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY pnpm-workspace.yaml package.json turbo.json pnpm-lock.yaml tsconfig.json eslint.config.js .prettierrc .eslintrc.json ./
COPY packages/ ./packages/
COPY services/payment-service/ ./services/payment-service/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @microservices-demo/shared-types build
RUN pnpm --filter @microservices-demo/shared-utils build
WORKDIR /app/services/payment-service
RUN pnpm db:generate
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/payment-service ./services/payment-service
WORKDIR /app/services/payment-service
EXPOSE 3005
ENV PORT=3005
CMD ["node", "dist/index.js"]
