import { FastifyInstance } from 'fastify';

export async function registerHealthRoutes(fastify: FastifyInstance, serviceName: string, version: string) {
  fastify.get('/health', async (_request, reply) => {
    return reply.status(200).send({ status: 'healthy' });
  });

  fastify.get('/version', async (_request, reply) => {
    return reply.status(200).send({ service: serviceName, version });
  });

  fastify.get('/metrics', async (_request, reply) => {
    reply.type('text/plain');
    return `# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 0.08
# HELP http_requests_total Total number of HTTP requests.
# TYPE http_requests_total counter
http_requests_total{service="${serviceName}",status="200"} 42
`;
  });
}
