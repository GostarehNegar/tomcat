import * as container from './ServiceProvider'

export interface ILogger {
    log(message?: any, ...params: any[])
}
export import IServiceProvider = container.IServiceProvider
