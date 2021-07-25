import { IServiceContainer, ServiceContainer } from "../../base/ServiceContainer";
import { IHost, IHostBuilder, IHostCollection, IWebHost } from "../interfaces";
import http from 'http';
import ExpressWebHost from "./ExpressWebHost";
import { serviceNames } from "./ServerBuilder";
import { BackgroundService } from "./BackgroundService";
import { Host } from "./Host";
import { WebSocketHub } from "./WebSocketHub";
import { MessageBus } from "../../MessageBus/Implementations";
import config from "../../config";
//import { IConfig } from "../../interfaces";


export class HostBuilder implements IHostBuilder {

    private addWebSocket: boolean;
    private websocketPath?: string;
    private _config: typeof config;

    public services: IServiceContainer;
    constructor(private _name?: string, private _collection?: IHostCollection) {
        this._name = _name || `host-${Math.random()}`;
        this.services = new ServiceContainer();
        /// Add a dummy host that will be eventually
        /// replaced with the actual one, so that there is
        /// a current host
        ///
        this._collection?.add(this._name, new Host(this._name, this.services));
        this._config = JSON.parse(JSON.stringify(config));
        this.services.register(serviceNames.Config, this._config);
    }
    addMessageBus(cf?: (c: typeof config.messaging) => void): IHostBuilder {
        const bus = new MessageBus(cf, this._config.messaging);
        this.services.register(serviceNames.IHostedService, bus);
        this.services.register(serviceNames.IMessageBus, bus);
        return this;
    }
    addRouter(router: () => unknown): IHostBuilder {
        this.services.register(serviceNames.Router, router);
        return this;
    }
    buildWebHost(): IWebHost {
        //this.addHttp();
        const result = new ExpressWebHost(this._name, this.services);
        this.services.register(serviceNames.IWebHost, result);
        if (this.addWebSocket) {
            const hub = new WebSocketHub(this.services, {
                server: result.http,
                path: this.websocketPath
            })
            this.services.register(serviceNames.WebSocketHub, hub);
            this.services.register(serviceNames.IHostedService, hub);
        }
        this._collection?.add(this._name, result);

        return result;

    }
    addExpress() {
        throw new Error("Method not implemented.");
    }
    addHttp(): IHostBuilder {
        this.services.register(serviceNames.HttpServer, () => {
            return http.createServer();
        }, true);
        return this;
    }
    addWebSocketHub(path?: string): IHostBuilder {
        this.addWebSocket = true;
        this.websocketPath = path;


        return this;
    }
    public addDefaultServices(): IHostBuilder {
        return this;
    }
    public build(): IHost {
        const result = new Host(this._name, this.services);
        this._collection?.add(this._name, result);
        return result;

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
