import { baseUtils } from "../base"

export type ServiceCategories = "data" | "indicator" | "strategy" | "telegram"

export interface IMeshService {
    getInformation(): ServiceInformation
    start(): Promise<unknown>
}

export interface ServiceConstructor {
    (serviceDefinition: ServiceDefinition): IMeshService
}
export interface IServiceDefinitionParameters {
    [key: string]: unknown
    "interval"?: string
}
export class ServiceDefinition {
    public category: ServiceCategories
    public parameters: IServiceDefinitionParameters = {}
}
export class ServiceInformation extends ServiceDefinition {
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