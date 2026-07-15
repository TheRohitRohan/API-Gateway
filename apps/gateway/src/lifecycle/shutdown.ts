import { FastifyInstance } from 'fastify';
import { redis } from '../redis/client.js';
import { beginShutdown } from './state.js';
import { getActiveRequestCount } from '../observability/metrics/http.js';

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
let shuttingDown = false;

export function registerGracefulShutdown(app: FastifyInstance) {
    async function shutdown(signal: string) {
        if (shuttingDown) {
            return;
        }

        shuttingDown = true;

        app.log.info(`${signal} received. Starting graceful shutdown...`);

        beginShutdown();

        const timeout = 30_000;
        const started = Date.now();

        while (getActiveRequestCount() > 0 && Date.now() - started < timeout) {
            app.log.info(`Waiting for ${getActiveRequestCount()} active requests...`);

            await sleep(100);
        }

        try {
            app.log.info('Closing Fastify...');
            await app.close();

            app.log.info('Closing Redis...');
            await redis.quit();

            app.log.info('Shutdown complete.');
        } catch (err) {
            app.log.error(err, 'Error during shutdown');
        } finally {
            process.exit(0);
        }
    }

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
