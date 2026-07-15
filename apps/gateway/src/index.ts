import { createServer } from './server.js';
import { executeMiddleware } from './middleware/execute.js';
import { logger } from './middleware/logger.js';
import { proxyMiddleware } from './middleware/proxy.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { routerMiddleware } from './middleware/router.js';
import { authMiddleware } from './middleware/auth.js';
import { authorizeMiddleware } from './middleware/authorize.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { connectRedis } from './redis/client.js';
import { metricsMiddleware } from './observability/metrics/middleware.js';
import { register } from './observability/metrics/registry.js';
import { getGatewayHealth } from './observability/health/index.js';
import { registerGracefulShutdown } from './lifecycle/shutdown.js';
import { startHealthChecker } from './health-checker/checker.js';
import { services } from './config/services';
import { registerService } from './discovery/registry';
import { registerDiscoveryRoutes } from './discovery/routes.js';

const app = createServer();

registerDiscoveryRoutes(app);

for (const service of services) {
    registerService(service);
}

registerGracefulShutdown(app);

app.get('/metrics', async (_, reply) => {
    console.log(await register.getMetricsAsJSON());

    reply.type(register.contentType);
    return register.metrics();
});

app.get('/health', async (_, reply) => {
    return reply.send(await getGatewayHealth());
});

app.all('/*', async (request, reply) => {
    console.log('Route handler reached');

    await executeMiddleware(request, reply, [
        requestIdMiddleware,
        logger,
        metricsMiddleware,
        authMiddleware,
        routerMiddleware,
        authorizeMiddleware,
        rateLimiter,
        proxyMiddleware,
    ]);

    console.log('Route handler finished');
});

const start = async () => {
    try {
        await connectRedis();

        startHealthChecker();

        console.log(app.printRoutes());

        await app.listen({
            port: 3000,
            host: '0.0.0.0',
        });
        console.log('Gateway started on 3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
