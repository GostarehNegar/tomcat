import http from 'http';

import { IServiceProvider, ServiceProvider } from '../base';
import { MessageBus } from '../bus';
import { config } from '../config';



import { BackgroundService } from './BackgroundService';
import ExpressWebHost from './ExpressWebHost';
import { Host } from './Host';
import { IHost } from './IHost';
import { IHostBuilder } from './IHostBuilder';
import { IHostCollection } from './IHostCollection';
import { IHttpHandler } from './IHttpHandler';
import { IWebHost } from './IWebHost';
import { serviceNames } from './ServerBuilder';
import { LightWebHost } from './SimpleWebHost';
import { WebSocketHub } from './WebSocketHub';

export class HostBuilder implements IHostBuilder {
  private addWebSocket: boolean;
  private websocketPath?: string;
  private _config: typeof config;
  private handlers: IHttpHandler[] = [];

  public services: IServiceProvider;
  constructor(private _name?: string, private _collection?: IHostCollection) {
    this._name = _name || `host-${Math.random()}`;
    this.services = new ServiceProvider();
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
  buildWebHost(type?: 'light' | 'express'): IWebHost {
    //this.addHttp();
    type = type || 'light';
    //        const result: WebHost = null;
    const result =
      type === 'light'
        ? new LightWebHost(this._name, this.services)
        : new ExpressWebHost(this._name, this.services);
    this.services.register(serviceNames.IWebHost, result);
    result.createServer(result.listener);
    if (this.addWebSocket) {
      const hub = new WebSocketHub(this.services, {
        server: result.httpServer,
        path: this.websocketPath,
      });
      this.services.register(serviceNames.WebSocketHub, hub);
      this.services.register(serviceNames.IHostedService, hub);
    }
    this._collection?.add(this._name, result);

    this.handlers.map((h) => result.use(h));
    return result;
  }
  addBinance() {
    // this.handlers.push(api2);
    return this;
  }
  addServices(cb: (s: IServiceProvider) => void): IHostBuilder {
    cb(this.services);
    return this;
  }

  addExpress() {
    throw new Error('Method not implemented.');
  }
  addHttp(): IHostBuilder {
    this.services.register(
      serviceNames.HttpServer,
      () => {
        return http.createServer();
      },
      true
    );
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
  public addHostedService(
    task: BackgroundService | ((IServiceLocator) => BackgroundService)
  ): IHostBuilder {
    this.addService(serviceNames.IHostedService, task);
    return this;
  }
  public addService(
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctor: any | ((loc: IServiceProvider) => any),
    key?: string
  ): IHostBuilder {
    this.services.register(name, ctor, false, key);
    return this;
  }
}
