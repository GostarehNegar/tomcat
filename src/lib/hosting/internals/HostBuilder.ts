import _locator, { IServiceContainer } from "../../base/ServiceContainer";
import { IHost, IHostBuilder, IWebHost } from "../interfaces";
import http from 'http';
import ExpressWebHost from "./ExpressWebHost";
import { serviceNames } from "./ServerBuilder";
import { BackgroundService } from "./BackgroundService";
import { Host } from "./Host";


export class HostBuilder implements IHostBuilder {

    public services: IServiceContainer = _locator;
    constructor() {
        ("");

    }
    buildWebHost(): IWebHost {
        //this.addHttp();
        const result = new ExpressWebHost(this.services);
        this.services.register(serviceNames.IWebHost, result);
        return result;

    }
    addExpress() {
        throw new Error("Method not implemented.");
    }
    addHttp() {
        this.services.register(serviceNames.HttpServer, () => {
            return http.createServer();
        }, true);
    }
    public addDefaultServices(): IHostBuilder {
        return this;
    }
    public build(): IHost {
        return new Host(this.services);

    }
    public addHostedService(task: BackgroundService | ((IServiceLocator) => BackgroundService)): IHostBuilder {
        this.addService(serviceNames.IHostedService, task);
        return this;
    }
    public addService(name: string, ctor: any | ((loc: IServiceContainer) => any), key?: string): IHostBuilder {
        this.services.register(name, ctor, false, key);
        return this;
    }


}
