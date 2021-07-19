import { IServiceContainer } from "../base";


export interface CanellationToken {
    get isCancelled(): boolean;
}
export interface IHost {
    get services(): IServiceContainer;
    start(): Promise<void>;
    stop(): Promise<void>

}
export interface IWebHost extends IHost {
    listen(port?: number);

}
export interface IHostBuilder {
    build(): IHost;
    buildWebHost(): IWebHost;
    addHostedService(task: IHostedService | ((IServiceLocator) => IHostedService)): IHostBuilder;
    addService(name: string, ctor: any | ((locator: IServiceContainer) => any), key?: string): IHostBuilder;
    addHttp();
    addExpress();

}
export interface IHostedService {
    start(): Promise<any>;
    stop(): Promise<any>;

}
