import { getServices } from '../discovery/registry.js';

export function findService(path: string) {
    return getServices().find((service) => path.startsWith(service.prefix));
}
