import { ServiceDefinition } from "./ServiceDefinition";
import { ServiceInformation } from ".";


export interface IMeshNode {
    startService(serviceDefinition: ServiceDefinition): Promise<ServiceInformation>;
}
