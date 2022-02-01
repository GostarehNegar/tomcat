import { baseUtils } from "../base";
import { ServiceDefinition, ServiceDefinitionHelper } from "../mesh";

export function getServiceDefintionExtentions(def: ServiceDefinition): ServiceDefinitionHelper {
    return new ServiceDefinitionHelper(def);
}
export function extendServiceDefinition(def: ServiceDefinition): ServiceDefinition {
    return baseUtils.extend(new ServiceDefinition(), def)
}