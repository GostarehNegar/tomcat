import { queryServiceCapabilityReply } from "../contracts";


import { ServiceDefinition, ServiceInformation } from ".";

export interface IServiceDiscovery {
    discover(serviceDefinition: ServiceDefinition): Promise<ServiceInformation[]>
    queryServiceCapability(serviceDefinition: ServiceDefinition): Promise<queryServiceCapabilityReply[]>
    executeService(serviceDefinition: ServiceDefinition): Promise<unknown>
}