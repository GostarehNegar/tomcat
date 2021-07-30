import { IServiceProvider } from "../base";
import express from 'express';
import { config } from "../interfaces";
import { IMessageBus } from "../MessageBus/interfaces";
import { IncomingHttpHeaders, IncomingMessage, OutgoingHttpHeaders } from "http";
import { ServerResponse } from "node:http";

export interface IMiddleware {
    (req, res, next): void;
}

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
    use(handle: IHttpHandler);
    addPeer(url: string);

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
    buildWebHost(type?: "light" | 'express'): IWebHost;
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

export interface IHttpContext {
    readonly request: IHttpRequest;
    readonly response: IHttpResponse;

}
export interface IHttpRequest extends IncomingMessage {
    get headers(): IRequestHeaders;

}
export interface IHttpResponse extends ServerResponse {

}
export interface IHttpHandler {
    (ctx: IHttpContext, next: (ctx: IHttpContext) => Promise<unknown>): Promise<any>;
}
export interface IRequestHeaders extends IncomingHttpHeaders {
    'x-forward-peers'?: string | string[] | undefined;
    'x-forward-chain'?: string | string[] | undefined;


}
export interface IResponseHeaders extends OutgoingHttpHeaders {

}
export interface IPeer {

}
export interface IPeerCollection {

}