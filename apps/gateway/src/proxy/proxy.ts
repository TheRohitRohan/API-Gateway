import { FastifyRequest, FastifyReply } from 'fastify';
import { ServiceConfig } from '../config/services.js';
import { GatewayRequest } from '../types/gateway.js';
import { executeRequest } from '../utils/fetch.js';
import { Readable } from 'node:stream';
import { getCircuitBreaker } from '../resilience/breakers.js';
import { CircuitBreakerOpenError } from '../resilience/CircuitBreaker.js';
import { isRetryableError, retry, RetryableHttpError } from '../resilience/retry.js';
import {
    recordRetry,
    recordUpstreamFailure,
    recordUpstreamRequest,
    startUpstreamRequestTimer,
    UpstreamFailureReason,
} from '../observability/metrics/index.js';
import { getLoadBalancer } from '../load-balancer/breakers.js';
import { logger } from '../logger.js';
import { ReadableStream } from 'node:stream/web';

export async function proxyRequest(
    request: FastifyRequest,
    reply: FastifyReply,
    service: ServiceConfig,
) {
    let currentInstance = service.instances[0];
    const stopTimer = startUpstreamRequestTimer(service.name, currentInstance.id, request.method);

    try {
        const headers = new Headers(request.headers as HeadersInit);
        headers.delete('content-length');
        headers.delete('host');
        headers.delete('connection');

        const gatewayRequest = request as GatewayRequest;
        headers.set('x-request-id', gatewayRequest.requestId);

        if (gatewayRequest.user) {
            headers.set('x-user-id', gatewayRequest.user.id);
            headers.set('x-user-role', gatewayRequest.user.role);
            headers.set('x-user-email', gatewayRequest.user.email);
        }

        const shouldRetry = canRetry(request.method);

        const operation = async () => {
            currentInstance = getLoadBalancer(service.name).next(service.instances);

            logger.info(
                {
                    requestId: gatewayRequest.requestId,
                    service: service.name,
                    instance: currentInstance.id,
                    target: currentInstance.target,
                    method: request.method,
                    url: request.url,
                },
                'Forwarding request to upstream',
            );

            const breaker = getCircuitBreaker(currentInstance.id);

            return breaker.execute(async () => {
                return executeRequest(
                    `${currentInstance.target}${request.url}`,
                    {
                        method: request.method,
                        headers,
                        body:
                            request.method === 'GET' || request.method === 'HEAD'
                                ? undefined
                                : JSON.stringify(request.body),
                    },
                    service.timeout,
                );
            });
        };

        const response = shouldRetry
            ? await retry(operation, {
                  maxAttempts: service.retryAttempts,
                  baseDelay: service.retryDelay,
                  shouldRetry: isRetryableError,

                  onRetry(attempt, error, delay) {
                      request.log.warn(
                          {
                              requestId: gatewayRequest.requestId,
                              service: service.name,
                              instance: currentInstance.id,
                              method: request.method,
                              url: request.url,
                              attempt,
                              maxAttempts: service.retryAttempts,
                              delay: Math.round(delay),
                              reason: error instanceof Error ? error.message : 'Unknown error',
                          },
                          'Retrying downstream request',
                      );

                      recordRetry(
                          service.name,
                          currentInstance.id,
                          error instanceof Error ? error.name : 'unknown',
                      );
                  },
              })
            : await operation();

        logger.info(
            {
                requestId: gatewayRequest.requestId,
                instance: currentInstance.id,
                status: response.status,
            },
            'Received upstream response',
        );

        recordUpstreamRequest(service.name, currentInstance.id, request.method, response.status);

        if (response.status >= 500) {
            recordUpstreamFailure(
                service.name,
                currentInstance.id,
                UpstreamFailureReason.Upstream5xx,
            );
        }

        stopTimer({
            status: String(response.status),
        });

        for (const [key, value] of response.headers) {
            reply.header(key, value);
        }

        reply.status(response.status);

        if (!response.body) {
            return reply.send();
        }

        const stream = Readable.fromWeb(response.body as unknown as ReadableStream);

        return reply.send(stream);
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            stopTimer({
                status: '504',
            });
            recordUpstreamFailure(service.name, currentInstance.id, UpstreamFailureReason.Timeout);

            logger.warn(
                {
                    service: service.name,
                    instance: currentInstance.id,
                    target: currentInstance.target,
                    timeout: service.timeout,
                },
                'Downstream service timed out',
            );

            return reply.status(504).send({
                error: 'Gateway Timeout',
                message: 'The downstream service did not respond in time.',
            });
        }

        if (err instanceof CircuitBreakerOpenError) {
            stopTimer({
                status: '503',
            });
            recordUpstreamFailure(
                service.name,
                currentInstance.id,
                UpstreamFailureReason.CircuitOpen,
            );

            return reply.status(503).send({
                error: 'Service Unavailable',
                message: 'The downstream service is temporarily unavailable.',
            });
        }

        if (err instanceof RetryableHttpError) {
            stopTimer({
                status: String(err.response.status),
            });
            recordUpstreamFailure(
                service.name,
                currentInstance.id,
                UpstreamFailureReason.RetryExhausted,
            );

            return reply.status(err.response.status).send(await err.response.text());
        }

        request.log.error(err);

        stopTimer({
            status: '502',
        });
        recordUpstreamFailure(service.name, currentInstance.id, UpstreamFailureReason.Unknown);

        return reply.status(502).send({
            error: 'Bad Gateway',
        });
    }
}

function canRetry(method: string): boolean {
    switch (method) {
        case 'GET':
        case 'HEAD':
        case 'OPTIONS':
            return true;

        default:
            return false;
    }
}
