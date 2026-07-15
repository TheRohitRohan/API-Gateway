# API Gateway Service

The API Gateway is a production-grade, Fastify-based gateway designed as the single entry point for all client requests. It handles security, routing, resiliency, load balancing, rate limiting, and observability, allowing downstream microservices to focus purely on business logic.

---

## Core Features & Architecture

```mermaid
flowchart TD
    Client([Client Request]) -->|HTTPS / Port 3000| Gateway[API Gateway]

    subgraph Middleware Pipeline
        M1[Request ID Generator] --> M2[Pino Request Logger]
        M2 --> M3[Prometheus Metrics]
        M3 --> M4[JWT Authentication]
        M4 --> M5[Prefix Routing Router]
        M5 --> M6[Role Authorization RBAC]
        M6 --> M7[Redis Rate Limiter]
        M7 --> M8[Proxy & Load Balancer]
    end

    Gateway --> Middleware Pipeline
    M8 -->|Round-Robin| Downstream[Upstream Microservice Instance]
```

### 1. Reverse Proxy & Dynamic Routing

- Inbound requests matching defined service prefixes are forwarded to downstream instances.
- The path and query parameters are propagated transparently to upstream services.
- Connection headers like `content-length`, `host`, and `connection` are stripped to prevent upstream protocol interference.

### 2. HTTPS & SSL Termination

- Configured to run over secure **HTTPS**.
- Local certificates are mounted from `apps/gateway/certs` (using files `localhost+2.pem` and `localhost+2-key.pem`).

### 3. JWT Authentication & Role-Based Access Control (RBAC)

- **JWT Verification**: Checks the `Authorization: Bearer <token>` header against the configured `JWT_SECRET`.
- **Public Bypasses**: Paths such as `/api/v1/auth/login`, `/api/v1/auth/register`, `/health`, `/metrics`, and `/documentation` are exposed publicly.
- **RBAC**: Enforces role access policies at the gateway layer (e.g., `cart-service` permits only users with the `customer` role).
- **Identity Injections**: Attaches verified identity headers when routing downstream:
    - `x-request-id` (UUID generated per request)
    - `x-user-id` (Extracted from JWT payload)
    - `x-user-role` (Extracted from JWT payload)
    - `x-user-email` (Extracted from JWT payload)

### 4. Redis-Backed Rate Limiting

- Capped at **5 requests per 10-second window** per client (configurable in `src/config/rateLimit.ts`).
- Identifies requests by `request.user.id` (authenticated) or fallback client `ip` (anonymous).
- Injects standard HTTP headers:
    - `X-RateLimit-Limit`: Maximum requests allowed in the window.
    - `X-RateLimit-Remaining`: Remaining request quota.
    - `X-RateLimit-Reset`: Time remaining in seconds before window reset.
- Returns `429 Too Many Requests` on violation.

### 5. Load Balancing (Round-Robin with Health Checks)

- Distributes traffic to multiple configured backend instances (e.g. `product-service-1`, `product-service-2`, `product-service-3`).
- Performs periodic background health checks (GET `/health` every 5 seconds) to keep an in-memory health registry.
- Skips instances that either fail the health checks or have their circuit breakers open.

### 6. Resilience Patterns

- **Circuit Breaker**: Implemented per service instance (CLOSED, OPEN, HALF_OPEN).
    - Tripped to `OPEN` on 5 consecutive failures.
    - Resets to `CLOSED` after a successful trial request during `HALF_OPEN` (minimum 30-second cooldown).
    - Returns `503 Service Unavailable` when the circuit is open.
- **Retry Policy**:
    - Automatically retries failed request operations on safe/idempotent HTTP methods (`GET`, `HEAD`, `OPTIONS`).
    - Triggers only on retryable error types (e.g., HTTP status 502, 503, 504 or network errors like `ECONNRESET`, `ECONNREFUSED`, `ETIMEDOUT`).
    - Uses exponential backoff with randomized jitter.
- **Timeouts**: Enforces request-level timeouts (default 5000ms) with `AbortController`, returning `504 Gateway Timeout` upon expiry.

### 7. Dynamic Service Discovery

- Exposes registry endpoints to scale instances up or down at runtime:
    - `GET /discovery`: View the current routing table configuration.
    - `POST /discovery/register`: Register a new upstream service instance.
        - Body: `{ "service": "product-service", "id": "product-4", "target": "http://product-service-4:3032" }`
    - `DELETE /discovery/:service/:instance`: Deregister an active service instance.

### 8. Observability

- **Metrics**: Exposes Prometheus metrics via `GET /metrics`, reporting:
    - HTTP request count and latency distributions.
    - Rate limiting actions.
    - Upstream request retries and transition states of circuit breakers.
- **Health**: Exposes a detailed self-diagnostic endpoint via `GET /health` reflecting Node.js runtime, Redis connection, and downstream dependencies.
- **Logging**: Configured with Pino logging to output structured JSON formatted logs.

---

## Directory Structure

```text
src/
├── auth/                 # Auth roles and token payload type definitions
├── config/               # Gateway configurations (services, rate limit window, JWT)
├── discovery/            # Dynamic service discovery registry and routes
├── health-checker/       # Background periodic health check runner
├── lifecycle/            # Graceful shutdown handler
├── load-balancer/        # Round Robin load balancer
├── middleware/           # HTTP Request Middleware pipeline (Auth, rate limit, logging, proxy)
├── observability/        # Prometheus metrics configurations and health check probes
├── proxy/                # Downstream proxy engine with retry and circuit breaker hooks
├── redis/                # Redis connection client setup
├── resilience/           # Circuit Breaker state machine and Retry with Jitter utilities
├── types/                # Fastify type overrides and generic gateway types
├── utils/                # HTTP fetch client with AbortController timeout wrappers
├── index.ts              # Expressive gateway startup, route definitions, and middleware hooks
└── server.ts             # Fastify server instantiation with Pino-pretty logs and HTTPS setup
```

---

## Configuration

The gateway is configured via environment variables and static configuration files:

### Environment Variables

- `PORT` (default: `3000`): The port the gateway will listen on.
- `NODE_ENV`: Runtime environment (`development` or `production`).
- `REDIS_URL` (default: `redis://localhost:6380`): Target Redis connection string.
- `JWT_SECRET`: Secret key used to decode and verify JSON Web Tokens.

### Service Targets (`src/config/services.ts`)

Allows routing definitions, timeouts, and RBAC roles to be declared per service:

```typescript
export const services: ServiceConfig[] = [
    {
        name: 'product-service',
        prefix: '/api/v1/products',
        instances: [
            { id: 'product-1', target: 'http://product-service-1:3002' },
            { id: 'product-2', target: 'http://product-service-2:3012' },
        ],
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 100,
    },
    // ...
];
```

---

## How to Test and Interact

All commands should be executed at the monorepo root (unless testing the gateway standalone).

### Running Standalone Dev Mode

```bash
# From apps/gateway
pnpm dev
```

### Accessing operational endpoints

- **Gateway Metrics**:
    ```bash
    curl -k https://localhost:3000/metrics
    ```
- **Gateway Health Check**:
    ```bash
    curl -k https://localhost:3000/health
    ```
- **List Dynamic Routing Table**:
    ```bash
    curl -k https://localhost:3000/discovery
    ```
