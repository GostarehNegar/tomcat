import * as container from './ServiceContainer'
export interface ILogger {
    log(message?: any, ...params: any[])
}
export import IServiceContainer = container.IServiceContainer
