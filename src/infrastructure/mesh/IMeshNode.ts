import { ServiceDefinition } from "./ServiceDefinition";
import { ServiceInformation } from ".";


export interface IMeshNode {
    /**
     * starts a service based on the passed definition
     * and return the service status information.
     * Note that if a service with the same definition is 
     * already started, it only returns the status of that
     * service.
     * @param serviceDefinition 
     */
    startService(serviceDefinition: ServiceDefinition): Promise<ServiceInformation>;
    stopService(serviceDefinition: ServiceDefinition): Promise<ServiceInformation>;
    getRunnigServices(): ServiceInformation[];
}
