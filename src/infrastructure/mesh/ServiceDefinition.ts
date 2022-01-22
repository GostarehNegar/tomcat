
import { baseUtils } from "../base"
import { IMeshService } from "./IMeshService"

export type ServiceCategories = "data" | "indicator" | "strategy" | "telegram" | "proxy" | "redis" | "helper" | "miscelaneous"

export interface ServiceConstructor {
    (serviceDefinition: ServiceDefinition): IMeshService
}
export interface IServiceDefinitionParameters {
    [key: string]: any
}
export class ServiceDefinitionBase<T extends IServiceDefinitionParameters> {
    public category: ServiceCategories
    public parameters: T = {} as T
    toString() {
        return JSON.stringify(this)
    }
}
export class ServiceDefinition extends ServiceDefinitionBase<IServiceDefinitionParameters> {
}

export type ServiceStatus = "start" | "stop" | "pause" | 'unknown'
export class ServiceInformation extends ServiceDefinition {
    public status: ServiceStatus
}
export class ServiceDescriptor {
    public serviceDefinition: ServiceDefinition
    public serviceConstructor: ServiceConstructor
}

export class ServiceDefinitionHelper {
    constructor(public definition: ServiceDefinition) {

    }
    public get name(): string {
        let result = `${this.definition.category}`;
        for (const key in this.definition.parameters) {
            result += `-${key}:${this.definition.parameters[key]}`
        }
        return result;
    }
}


export const matchService = (description: ServiceDefinition, pattern: ServiceDefinition): boolean => {
    if (description.category == pattern.category) {
        for (const key in pattern.parameters) {
            if (description.parameters[key] && !baseUtils.wildCardMatch(description.parameters[key], pattern.parameters[key])) {
                return false
            }
        }
        return true
    }
    return false

}