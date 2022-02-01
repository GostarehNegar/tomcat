
import { IMeshServiceMain } from "."
import { baseUtils } from "../base"
import { IMeshService } from "./IMeshService"

export type ServiceCategories = "data" | "indicator" | "strategy" | "telegram" | "proxy" | "redis" | "helper" | "miscelaneous"

export interface ServiceConstructor {
    (serviceDefinition: ServiceDefinition): IMeshService
}
export interface IServiceDefinitionParameters {
    [key: string]: any
}
export interface IServiceDefinitionBase<T extends IServiceDefinitionParameters> {
    category: ServiceCategories;
    parameters: T;

}
export class ServiceDefinitionBase<T extends IServiceDefinitionParameters> implements IServiceDefinitionBase<T> {
    public category: ServiceCategories
    public parameters: T = {} as T
    toString() {
        return JSON.stringify(this)
    }
    getName?: () => string = () => {
        let result = `${this.category}`;
        for (const key in this.parameters) {
            result += `-${key}:${this.parameters[key]}`
        }
        return result;
    }
    match?: (other: IServiceDefinition) => boolean = (pattern) => {
        if (this.category == pattern.category) {
            for (const key in pattern.parameters) {
                if (this.parameters[key] && !baseUtils.wildCardMatch(this.parameters[key], pattern.parameters[key])) {
                    return false
                }
            }
            return true
        }
        return false
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

export interface IServiceDefinition extends IServiceDefinitionBase<IServiceDefinitionParameters> {

}


export class ServiceDefinition extends ServiceDefinitionBase<IServiceDefinitionParameters> {

}


export type ServiceStatus = "start" | "stop" | "pause" | 'unknown'
export class ServiceInformation {
    public definition: ServiceDefinition
    public status: ServiceStatus
    public info?: { [key: string]: string; } = {}
    isRunning?= () => {
        return this.status && this.status === 'start';
    }

}


export interface IServiceDescriptorOptions {
    'startNewHost'?: boolean

}
export interface IServiceDescriptor {
    userServiceConstructor(def: ServiceDefinition, options: IServiceDescriptorOptions, ctor: (def: ServiceDefinition) => IMeshService);
    useRunMethod(def: ServiceDefinition, options: IServiceDescriptorOptions,
        /**
         * service main run method. 
         * This is called by the MeshNode to start the service.
         * Typicaly it will include a while(!ctx.cancellationToken.iscancelled) loop.
         *  
         */
        main: IMeshServiceMain);

}


export class ServiceDefinitionHelper {
    constructor(public definition: ServiceDefinition) {
        definition = baseUtils.extend(new ServiceDefinition(), definition);

    }
    public get name(): string {
        let result = `${this.definition.category}`;
        for (const key in this.definition.parameters) {
            result += `-${key}:${this.definition.parameters[key]}`
        }
        return result;
    }
}


