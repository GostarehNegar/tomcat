import { IServiceProvider } from "../base";
import express from 'express';
import { config } from "../interfaces";
import { IMessageBus } from "../MessageBus/interfaces";



export interface CanellationToken {
    get isCancelled(): boolean;
}
export interface IHost {
    get services(): IServiceProvider;
    get name(): string;
    start(): Promise<unknown>;
    stop(): Promise<unknown>;
    get config(): typeof config;
    get bus(): IMessageBus;


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
    getHostBuilder(name?: string): IHostBuilder;
    get current(): IHost;

}
/**
 * Represents a host builder that can be
 * used to build a web or console host that
 * will provide features to the end user.
 * 
 */
export interface IHostBuilder {
    /**
     * Builds a simple console host.
     */
    build(): IHost;
    /**
     * Builds an 'express' web host.
     */
    buildWebHost(): IWebHost;
    addHostedService(task: IHostedService | ((IServiceLocator) => IHostedService)): IHostBuilder;
    addService(name: string, ctor: any | ((locator: IServiceProvider) => any), key?: string): IHostBuilder;
    addRouter(router: unknown): IHostBuilder;
    addWebSocketHub(path?: string): IHostBuilder;
    addHttp(): IHostBuilder;
    addExpress();
    addMessageBus(cf?: (c: typeof config.messaging) => void): IHostBuilder;

}
export interface IHostedService {
    start(): Promise<unknown>;
    stop(): Promise<unknown>;

}
