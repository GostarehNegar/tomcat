
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
    /**
     * key value parameters to define and
     * configure a service.
     */
    parameters: T;

}
export class ServiceDefinitionBase<T extends IServiceDefinitionParameters> implements IServiceDefinitionBase<T> {
    public category: ServiceCategories
    public parameters: T = {} as T
    constructor(cat?: ServiceCategories, params?: T) {
        this.category = cat;
        this.parameters = params || ({} as T);

    }
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

        if (pattern && this.category == pattern.category) {
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

/**
 * defines a service by providing a catagory identity
 * together with a set of parameters.
 */

export class ServiceDefinition extends ServiceDefinitionBase<IServiceDefinitionParameters> {


}


export type ServiceStatus =
    /**
     * started
     */
    "started" | "stop" | "pause" | 'unknown' | 'error';


export class ServiceInformation {
    constructor(def?: ServiceDefinition) {
        this.definition = def;
    }
    public definition: ServiceDefinition
    public status: ServiceStatus
    public lastError?: any
    public info?: { [key: string]: string; } = {}
    isRunning?= () => {
        return this.status && this.status === 'started';
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


