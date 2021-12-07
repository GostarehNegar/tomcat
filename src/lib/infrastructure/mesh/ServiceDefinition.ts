export type ServiceCategories = "data" | "indicator" | "strategy" | "telegram"
export interface IServiceDefinitionParameters {
    [key: string]: unknown
    "interval"?: string
}
export class ServiceDefinition {
    public category: ServiceCategories
    public parameters: IServiceDefinitionParameters = {}
}
