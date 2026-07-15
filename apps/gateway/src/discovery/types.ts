export interface ServiceInstance {
    id: string;
    target: string;
    healthy: boolean;
}

export interface RegisteredService {
    name: string;
    prefix: string;
    instances: ServiceInstance[];
}
