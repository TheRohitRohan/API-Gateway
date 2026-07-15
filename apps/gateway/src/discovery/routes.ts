import { FastifyInstance } from 'fastify';
import { getRegistry, registerInstance, unregisterInstance } from './registry.js';

interface RegisterInstanceBody {
    service: string;
    id: string;
    target: string;
}

export async function registerDiscoveryRoutes(app: FastifyInstance) {
    app.get('/discovery', async () => {
        return Object.fromEntries(getRegistry());
    });

    app.post<{ Body: RegisterInstanceBody }>('/discovery/register', async (request, reply) => {
        const { service, id, target } = request.body;

        request.log.info(request.body, 'Discovery registration request');
        try {
            registerInstance(service, {
                id,
                target,
            });

            request.log.info(
                {
                    service,
                    instance: id,
                    target,
                },
                'Service instance registered',
            );

            return reply.send({
                success: true,
            });
        } catch (err) {
            return reply.status(404).send({
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    });

    app.delete<{
        Params: {
            service: string;
            instance: string;
        };
    }>('/discovery/:service/:instance', async (request, reply) => {
        const { service, instance } = request.params;

        unregisterInstance(service, instance);

        request.log.info(
            {
                service,
                instance,
            },
            'Service instance unregistered',
        );

        return reply.send({
            success: true,
        });
    });
}
