import Fastify from 'fastify';
import fs from 'node:fs';
import path from 'node:path';

export function createServer() {
    return Fastify({
        logger: {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid,hostname',
                    singleLine: false,
                },
            },
        },
        https: {
            key: fs.readFileSync(path.join(process.cwd(), 'certs', 'localhost+2-key.pem')),
            cert: fs.readFileSync(path.join(process.cwd(), 'certs', 'localhost+2.pem')),
        },
    });
}
