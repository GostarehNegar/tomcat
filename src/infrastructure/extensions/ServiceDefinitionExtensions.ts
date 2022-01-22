import { ServiceDefinition, ServiceDefinitionHelper } from "../mesh";

export function getServiceDefintionExtentions(def: ServiceDefinition): ServiceDefinitionHelper {
    return new ServiceDefinitionHelper(def);
}