import { queryServiceCapabilityReply } from "../contracts";

import { ServiceStatus } from "./ServiceStatus";

import { ServiceDefinition } from ".";

export interface IServiceDiscovery {
    discover(serviceDefinition: ServiceDefinition): Promise<ServiceStatus[]>
    queryServiceCapability(serviceDefinition: ServiceDefinition): Promise<queryServiceCapabilityReply[]>
    executeService(serviceDefinition: ServiceDefinition): Promise<unknown>
}