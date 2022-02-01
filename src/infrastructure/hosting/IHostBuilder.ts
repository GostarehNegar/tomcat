

import { IServiceProvider } from '../base';
import config from '../base/baseconfig';
import { IServiceDescriptor, MeshNodeConfiguration, ServiceConstructor, ServiceDefinition, ServiceDescriptor } from '../mesh';

import { IHost } from './IHost';
import { IHostedService } from "./IHostedService";
import { IWebHost } from './IWebHost';


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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ctor: any | ((locator: IServiceProvider) => any),
        key?: string
    ): IHostBuilder;
    addServices(cb: (s: IServiceProvider) => void): IHostBuilder;
    addRouter(router: unknown): IHostBuilder;
    addWebSocketHub(path?: string): IHostBuilder;
    addMeshServer(): IHostBuilder;
    addMeshNode(cb: (cfg: MeshNodeConfiguration) => void): IHostBuilder;
    addMeshService_deprecated(serviceDefinition: ServiceDefinition, ctor: ServiceConstructor): IHostBuilder
    addMeshService(configure: ((descriptor: IServiceDescriptor) => void) | ServiceDescriptor): IHostBuilder;

    addHttp(): IHostBuilder;
    addExpress();
    addMessageBus(cf?: (c: typeof config.messaging) => void): IHostBuilder;
    addBinance(): IHostBuilder;

}
