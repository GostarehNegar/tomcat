import { IServiceContainer } from "../base";
import express from 'express';


export interface CanellationToken {
    get isCancelled(): boolean;
}
export interface IHost {
    get services(): IServiceContainer;
    get name(): string;
    start(): Promise<unknown>;
    stop(): Promise<unknown>;

}
export interface IWebHost extends IHost {
    listen(port?: number): Promise<unknown>;
    get port(): number | string | null;
    expressApp: express.Application;
    close(): Promise<unknown>;

}
export interface IHostCollection {
    add(name: string, item: IHost): IHost;
    getByName(name: string): IHost;
    getDefualtBuilder(name?: string): IHostBuilder;
    get current(): IHost;

}
export interface IHostBuilder {
    build(): IHost;
    buildWebHost(): IWebHost;
    addHostedService(task: IHostedService | ((IServiceLocator) => IHostedService)): IHostBuilder;
    addService(name: string, ctor: any | ((locator: IServiceContainer) => any), key?: string): IHostBuilder;
    addRouter(router: unknown): IHostBuilder;
    addWebSocketHub(path?: string): IHostBuilder;
    addHttp(): IHostBuilder;
    addExpress();
    addMessageBus(channel?: string): IHostBuilder;

}
export interface IHostedService {
    start(): Promise<unknown>;
    stop(): Promise<unknown>;

}
