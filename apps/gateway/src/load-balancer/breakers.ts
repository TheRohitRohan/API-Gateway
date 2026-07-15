import { RoundRobin } from './RoundRobin.js';

const balancers = new Map<string, RoundRobin>();

export function getLoadBalancer(serviceName: string): RoundRobin {
    let balancer = balancers.get(serviceName);

    if (!balancer) {
        balancer = new RoundRobin();
        balancers.set(serviceName, balancer);
    }

    return balancer;
}
