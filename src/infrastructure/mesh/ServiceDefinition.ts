import { baseUtils } from "../base"

export type ServiceCategories = "data" | "indicator" | "strategy" | "telegram" | "proxy" | "redis"

export interface IMeshService {
    getInformation(): ServiceInformation
    start(): Promise<unknown>
}

export interface ServiceConstructor {
    (serviceDefinition: ServiceDefinition): IMeshService
}
export interface IServiceDefinitionParameters {
    [key: string]: unknown
}
export class ServiceDefinitionBase<T extends IServiceDefinitionParameters> {
    public category: ServiceCategories
    public parameters: T = {} as T
}
export class ServiceDefinition extends ServiceDefinitionBase<IServiceDefinitionParameters> {
}

export type ServiceStatus = "start" | "stop" | "pause"
export class ServiceInformation extends ServiceDefinition {
    public status: ServiceStatus
}
export class ServiceDescriptor {
    public serviceDefinition: ServiceDefinition
    public serviceConstructor: ServiceConstructor
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