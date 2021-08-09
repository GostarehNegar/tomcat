import {
  IncomingHttpHeaders,
  IncomingMessage,
  OutgoingHttpHeaders,
} from 'http';

import express from 'express';
import { ServerResponse } from 'node:http';


import { ILogger, IServiceProvider } from '../base';
import { IMessageBus } from "../bus";
import { config } from '../interfaces';


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
  use(
    handle: IHttpHandler,
    config?: { name: string; params: { [key: string]: string | number } }
  ): IWebHost;
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
  buildWebHost(type?: 'light' | 'express'): IWebHost;
  addHostedService(
    task: IHostedService | ((IServiceLocator) => IHostedService)
  ): IHostBuilder;
  addService(
    name: string,
    ctor: any | ((locator: IServiceProvider) => any),
    key?: string
  ): IHostBuilder;
  addServices(cb: (s: IServiceProvider) => void): IHostBuilder;
  addRouter(router: unknown): IHostBuilder;
  addWebSocketHub(path?: string): IHostBuilder;
  addHttp(): IHostBuilder;
  addExpress();
  addMessageBus(cf?: (c: typeof config.messaging) => void): IHostBuilder;
  addBinance(): IHostBuilder;
}
export interface IHostedService {
  start(): Promise<unknown>;
  stop(): Promise<unknown>;
}

export interface IHttpContext {
  readonly request: IHttpRequest;
  readonly response: IHttpResponse;
  getLogger(name?: string): ILogger;
}
export interface IHttpRequest extends IncomingMessage {
  get headers(): IRequestHeaders;
  get uri();
  params(key: string);
  getParams<T>(): T;
}
export type IHttpResponse = ServerResponse
export interface IHttpHandler {
  (
    ctx: IHttpContext,
    next: (ctx: IHttpContext) => Promise<unknown>
  ): Promise<any>;
}

export interface IRequestHeaders extends IncomingHttpHeaders {
  'x-forward-peers'?: string | string[] | undefined;
  'x-forward-chain'?: string | string[] | undefined;
}
export type IResponseHeaders = OutgoingHttpHeaders
export interface IPeer {
  get url(): string;
}
export interface IPeerCollection {
  get length(): number;
}
export const constants = {
  kkk: 'jj',
  ServiceNames: {
    ll: 'll',
  },
};
