import { Role, Roles } from '../auth/roles';

export interface ServiceInstance {
    id: string;
    target: string;
}

export interface ServiceConfig {
    name: string;
    prefix: string;
    instances: ServiceInstance[];
    roles?: Role[];
    timeout: number;

    retryAttempts: number;
    retryDelay: number;
}

export const services: ServiceConfig[] = [
    {
        name: 'auth-service',
        prefix: '/api/v1/auth',
        instances: [
            {
                id: 'auth-1',
                target: 'http://auth-service:3001',
            },
        ],
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 100,
    },
    {
        name: 'product-service',
        prefix: '/api/v1/products',
        instances: [
            {
                id: 'product-1',
                target: 'http://product-service-1:3002',
            },
            {
                id: 'product-2',
                target: 'http://product-service-2:3012',
            },
            {
                id: 'product-3',
                target: 'http://product-service-3:3022',
            },
        ],
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 100,
    },
    {
        name: 'cart-service',
        prefix: '/api/v1/cart',
        instances: [
            {
                id: 'cart-1',
                target: 'http://cart-service:3003',
            },
        ],
        roles: [Roles.Customer],
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 100,
    },
    {
        name: 'order-service',
        prefix: '/api/v1/orders',
        instances: [
            {
                id: 'order-1',
                target: 'http://order-service:3004',
            },
        ],
        roles: [Roles.Admin, Roles.Customer],
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 100,
    },
    {
        name: 'payment-service',
        prefix: '/api/v1/payments',
        instances: [
            {
                id: 'payment-1',
                target: 'http://payment-service:3005',
            },
        ],
        roles: [Roles.Customer],
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 100,
    },
    {
        name: 'notification-service',
        prefix: '/api/v1/notifications',
        instances: [
            {
                id: 'notification-1',
                target: 'http://notification-service:3006',
            },
        ],
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 100,
    },
];
