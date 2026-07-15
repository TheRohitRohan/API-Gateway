# API Gateway

A production-inspired API Gateway built with TypeScript and Fastify that implements core gateway patterns from scratch — TLS termination, JWT authentication, RBAC, health-aware load balancing, circuit breaking, retry with backoff, service discovery, rate limiting, and observability.

[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-framework-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Redis](https://img.shields.io/badge/Redis-Rate_Limiting-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Metrics-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![pnpm](https://img.shields.io/badge/pnpm-Workspaces-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

![System Architecture](docs/system-architecture.png)

---

## Overview

The gateway acts as the single entry point for all client traffic. It enforces security, manages upstream routing, and provides resilience guarantees before a request ever reaches a backend service.

| Capability                  | Details                                                                                 |
| :-------------------------- | :-------------------------------------------------------------------------------------- |
| TLS Termination             | HTTPS enforced at the edge using locally-trusted certificates via mkcert.               |
| JWT Authentication          | Bearer tokens validated on every non-public request; public routes bypass this stage.   |
| RBAC Authorization          | Per-service role policies enforced against the verified token payload.                  |
| Rate Limiting               | Sliding-window rate limits backed by Redis, keyed per user ID or IP address.            |
| Health-aware Load Balancing | Round-Robin across registered instances; unhealthy or open-circuit targets are skipped. |
| Circuit Breaker             | Per-instance stateful breaker (CLOSED / OPEN / HALF-OPEN) with configurable thresholds. |
| Retry with Backoff          | Exponential backoff with jitter for safe HTTP methods on transient upstream failures.   |
| Reverse Proxy               | Native stream-based proxying; identity headers injected before forwarding.              |
| Service Discovery           | Runtime registration and deregistration of service instances via HTTP API.              |
| Observability               | Prometheus metrics and structured JSON logs on every request.                           |
| Graceful Shutdown           | SIGTERM / SIGINT handling drains connections and closes Redis cleanly.                  |
| Docker Deployment           | Multi-stage Dockerfile; full environment orchestrated with Docker Compose.              |

---

## Design Principles

The gateway is built around a small set of core design principles:

- Single entry point for all client traffic
- Centralized cross-cutting concerns
- Stateless request processing
- Fail fast on invalid or unauthorized requests
- Backend services focus only on business logic
- Resilience before availability
- Built-in observability by default

---

## Why API Gateway?

Without a gateway, every service that accepts external traffic must independently implement authentication, authorization, rate limiting, logging, and security. This scatters infrastructure concerns across the codebase, creates inconsistency, and makes operational changes expensive.

![Why API Gateway](docs/why-api-gateway.png)

A gateway centralizes all cross-cutting concerns at the edge. Backend services receive only pre-authenticated, pre-authorized requests and are free to focus on their own business logic. Adding a new security policy, changing rate limit thresholds, or rotating JWT secrets requires a change in exactly one place.

---

## Request Lifecycle

Every inbound request passes through a sequential middleware pipeline. Each stage has one responsibility — if a stage fails, the request is rejected immediately with an appropriate status code rather than forwarding a partially processed request upstream.

![Request Lifecycle](docs/request-lifecycle.png)

The pipeline runs in order: TLS termination, JWT validation, RBAC check, rate limit enforcement, route resolution, load balancer instance selection, circuit breaker check, retry wrapper, and finally stream-based reverse proxy. The response travels back through the same connection. Failed authentication returns `401`, authorization failures return `403`, rate limit breaches return `429`, open circuit breakers return `503`, and upstream timeouts return `504`.

---

## Features

| Feature                     | Description                                                                         | Status |
| :-------------------------- | :---------------------------------------------------------------------------------- | :----: |
| HTTPS / TLS Termination     | SSL handled at the Fastify layer using PEM certificates.                            |   ✅   |
| JWT Authentication          | Validates `Authorization: Bearer` tokens; configurable secret and algorithm.        |   ✅   |
| Role-Based Authorization    | Checks `customer` / `admin` roles against per-route access rules.                   |   ✅   |
| Redis Rate Limiting         | Sliding-window limits per user ID or IP; configurable window and max requests.      |   ✅   |
| Dynamic Routing             | Prefix-based URL matching maps requests to registered service targets.              |   ✅   |
| Round-Robin Load Balancing  | Stateful balancer distributes requests evenly across healthy instances.             |   ✅   |
| Circuit Breaker             | CLOSED → OPEN → HALF-OPEN state machine per service instance.                       |   ✅   |
| Retry with Jitter           | Exponential backoff retries for GET / HEAD / OPTIONS on transient errors.           |   ✅   |
| Timeout Handling            | Per-request AbortController timeout; configurable, defaults to 5000 ms.             |   ✅   |
| Stream Proxy                | Binary stream forwarding with no body buffering to reduce memory overhead.          |   ✅   |
| Identity Header Propagation | Injects `x-request-id`, `x-user-id`, `x-user-role`, `x-user-email` before proxying. |   ✅   |
| Service Discovery           | Register and remove instances at runtime via HTTP without restarting.               |   ✅   |
| Background Health Checks    | Polls `GET /health` every 5 seconds; removes and restores instances automatically.  |   ✅   |
| Prometheus Metrics          | Exposes counters, histograms, gauges, and circuit state at `GET /metrics`.          |   ✅   |
| Structured JSON Logging     | Pino logger with request-scoped context on every gateway event.                     |   ✅   |
| Network Isolation           | Backend services and databases are only reachable inside Docker's bridge network.   |   ✅   |
| Graceful Shutdown           | Closes Redis connections and drains HTTP on SIGTERM / SIGINT.                       |   ✅   |
| Multi-stage Docker Build    | Separate build and runtime stages; production image contains only compiled output.  |   ✅   |

---

## Tech Stack

| Technology              | Role                                       |
| :---------------------- | :----------------------------------------- |
| Node.js                 | Runtime                                    |
| TypeScript              | Language                                   |
| Fastify                 | HTTP framework and middleware pipeline     |
| Redis                   | Rate limit store                           |
| `prom-client`           | Prometheus metrics collection and exposure |
| Pino                    | Structured JSON logging                    |
| `jsonwebtoken`          | JWT token verification                     |
| mkcert                  | Locally-trusted TLS certificate generation |
| Docker & Docker Compose | Containerization and service orchestration |
| Turborepo               | Monorepo task orchestration                |
| pnpm                    | Package manager and workspace management   |

---

## Project Structure

```
api-gateway/
├── apps/
│   └── gateway/              # Main project — the API Gateway
│       ├── certs/            # TLS certificates (mkcert)
│       ├── src/
│       │   ├── middleware/   # Request pipeline stages
│       │   ├── resilience/   # Circuit Breaker and Retry
│       │   ├── load-balancer/
│       │   ├── discovery/    # In-memory registry and HTTP routes
│       │   ├── health-checker/
│       │   ├── observability/
│       │   ├── proxy/
│       │   ├── config/
│       │   └── index.ts      # Entrypoint and pipeline bootstrap
│       └── Dockerfile
├── services/                 # Demo services (testing only)
├── docs/                     # Architecture diagrams
└── docker-compose.yml
```

> The `services/` directory contains minimal demo services used only to test the gateway. They are not the focus of this project.

---

## Getting Started

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/)
- [pnpm](https://pnpm.io/)
- [mkcert](https://github.com/FiloSottile/mkcert) — for local TLS certificates

### Install mkcert and generate certificates

```bash
# Install mkcert (macOS)
brew install mkcert
mkcert -install

# Generate certificates for the gateway
cd apps/gateway/certs
mkcert localhost 127.0.0.1
```

### Clone and install

```bash
git clone https://github.com/your-username/api-gateway.git
cd api-gateway

pnpm install
```

### Run with Docker

```bash
# Build and start the full environment
docker compose up --build
```

This starts the gateway and all demo services inside an isolated Docker bridge network. Only the gateway is reachable from the host on port `3000`.

### Verify

```bash
# Gateway health
curl -k https://localhost:3000/health

# Prometheus metrics
curl -k https://localhost:3000/metrics

# Registered services
curl -k https://localhost:3000/discovery/services
```

> The `-k` flag bypasses SSL verification for the self-signed local certificate. In Postman or Insomnia, disable "SSL Certificate Verification" in the request settings.

---

## API Endpoints

| Method   | Path                      | Description                                                               |
| :------- | :------------------------ | :------------------------------------------------------------------------ |
| `GET`    | `/health`                 | Gateway health status including Redis connectivity and per-service state. |
| `GET`    | `/metrics`                | Prometheus text-format metrics scraping endpoint.                         |
| `GET`    | `/discovery/services`     | Lists all registered service instances and their health status.           |
| `POST`   | `/discovery/register`     | Registers a new service instance into the routing pool at runtime.        |
| `DELETE` | `/discovery/:service/:id` | Removes a specific instance from the pool without restarting the gateway. |
| `ANY`    | `/api/v1/*`               | Catch-all entry point proxied to the resolved upstream service.           |

---

## Implemented Components

### Authentication

The gateway validates `Authorization: Bearer <token>` on every inbound request using `jsonwebtoken`. Routes designated as public (e.g. `/health`) bypass this stage. On failure, the request is rejected with `401 Unauthorized` before any upstream call is made.

### Authorization

After authentication, the gateway checks the token's role against the access policy of the target route. Policies are defined per service prefix in the route configuration. Insufficient permissions return `403 Forbidden` before any upstream call is made.

### Routing

Requests are matched against prefix-based route definitions. Each route maps a URL prefix to a service name in the discovery registry. Unmatched requests return `404 Not Found`.

### Health-aware Load Balancing

Requests are distributed across registered instances using Round-Robin. Before selecting an instance, the balancer excludes targets that are marked unhealthy or have an open circuit breaker. Instances can be added or removed via the Service Discovery API without restarting the gateway.

### Circuit Breaker

Each service instance has its own independent circuit breaker. After five consecutive failures the circuit opens; subsequent requests fail immediately with `503 Service Unavailable`. After a 30-second cooldown the circuit enters HALF-OPEN and permits one trial request. Success closes the circuit; failure reopens it.

### Retry

Safe and idempotent methods (`GET`, `HEAD`, `OPTIONS`) are automatically retried on transient failures. Retryable conditions include network-level errors (`ECONNRESET`, `ECONNREFUSED`, `ETIMEDOUT`, `EHOSTUNREACH`, `EPIPE`), abort errors, and upstream HTTP status codes `502`, `503`, and `504`. Retries use exponential backoff with randomized jitter to avoid synchronized retry storms.

### Rate Limiting

Rate limits are enforced using a Redis-backed sliding-window algorithm. Limits are keyed per authenticated user ID when a valid token is present, or per client IP for unauthenticated requests. Clients exceeding the threshold receive `429 Too Many Requests`.

### Reverse Proxy

Request bodies are streamed directly to the upstream instance without buffering. Before forwarding, the gateway injects `x-user-id`, `x-user-role`, and `x-user-email` so downstream services can trust the caller's identity without validating the token themselves. A unique `x-request-id` is generated on each request.

### Observability

Structured JSON logs are emitted via Pino on every request, including method, route, status code, duration, and upstream target. Prometheus-compatible metrics are collected via `prom-client` and exposed at `GET /metrics`. The `/health` endpoint reports Redis connectivity, instance counts, and circuit breaker states.

### Service Discovery

Instances are registered manually by calling `POST /discovery/register` with a service name and address. The gateway maintains an in-memory registry of all registered instances. A background health checker polls each instance every 5 seconds, marking unreachable instances as unhealthy and restoring them automatically when they pass a subsequent check.

### Graceful Shutdown

On `SIGTERM` or `SIGINT`, the gateway stops accepting new connections, closes the Redis client, and waits for in-flight requests to complete before exiting. This allows clean handoff in Docker and Kubernetes environments.

### Docker Deployment

The gateway ships with a multi-stage Dockerfile. The build stage compiles TypeScript; the runtime stage contains only compiled output and production dependencies. Docker Compose orchestrates the gateway, backend demo services, and Redis inside an isolated bridge network. Only the gateway is exposed to the host on port `3000`. The gateway exposes Prometheus-compatible metrics at `GET /metrics`; scraping must be configured externally.

---

## Observability

### Health Endpoint

`GET /health` returns a JSON response with the overall gateway status, Redis connection state, uptime, and the health status of every registered service instance. Useful for readiness probes and operational dashboards.

### Prometheus Metrics

`GET /metrics` exposes metrics in Prometheus text format. The following are available:

| Metric                            | Type      | Description                                                               |
| :-------------------------------- | :-------- | :------------------------------------------------------------------------ |
| `http_requests_total`             | Counter   | Total requests processed by the gateway.                                  |
| `http_request_duration_seconds`   | Histogram | End-to-end request latency.                                               |
| `gateway_active_requests`         | Gauge     | Requests currently in flight.                                             |
| `gateway_upstream_requests_total` | Counter   | Requests forwarded to upstream services.                                  |
| `gateway_upstream_failures_total` | Counter   | Upstream failures broken down by reason.                                  |
| `gateway_retries_total`           | Counter   | Total retry attempts made.                                                |
| `gateway_circuit_state`           | Gauge     | Per-instance circuit breaker state (0 = Closed, 1 = Half-Open, 2 = Open). |
| `gateway_rate_limited_total`      | Counter   | Requests rejected by the rate limiter.                                    |

### Logging

All logs are emitted as structured JSON via Pino. Each log entry includes the request ID, HTTP method, route, status code, response time, and upstream target. Log level is configurable via the `LOG_LEVEL` environment variable.

---

## Future Improvements

| Improvement                     | Description                                                                    | Status  |
| :------------------------------ | :----------------------------------------------------------------------------- | :-----: |
| OpenTelemetry Tracing           | Instrument spans across gateway and upstream services using the OTel SDK.      | Planned |
| Distributed Service Discovery   | Replace in-memory registry with Consul or etcd for multi-instance deployments. | Planned |
| Response Caching                | Redis-backed cache for idempotent `GET` endpoints with configurable TTL.       | Planned |
| Least-Connections Load Balancer | Route to the instance with the fewest active concurrent connections.           | Planned |
| Gateway-to-Service mTLS         | Authenticate internal requests using mutual TLS between gateway and services.  | Planned |
| Canary Deployments              | Route a configurable percentage of traffic to a new service version.           | Planned |
| API Versioning                  | Native support for versioned route prefixes (`/api/v1/`, `/api/v2/`).          | Planned |
| WebSocket Support               | Proxy long-lived WebSocket connections through the gateway.                    | Planned |
| Plugin System                   | Extensible middleware registration API for adding custom pipeline stages.      | Planned |
| Rate Limit Header Exposure      | Return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` headers.    | Planned |

---

## Contributing

Contributions that improve correctness, add missing gateway patterns, or improve test and observability coverage are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes with a descriptive message.
4. Open a pull request explaining what the change does and why.

Keep pull requests focused. One feature or fix per PR.
