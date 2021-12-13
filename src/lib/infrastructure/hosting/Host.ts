
import { config } from '../../config';
import { CancellationToken, IServiceProvider } from '../base';
import registrar from '../base/BaseRegistrar'
import { IMessageBus } from '../bus';
import { IMeshNode } from '../mesh';

import { IHost } from './IHost';
import { IHostedService } from './IHostedService';
import { serviceNames } from './ServerBuilder';

export class Host implements IHost {
  private _tasks: IHostedService[] = [];
  public started: boolean;
  public config: typeof config;
  // public pipeline: Pipeline
  // public bots: BotCollection;
  constructor(public name: string, public services: IServiceProvider) {
    this._tasks = this.services.getServices<IHostedService>(
      serviceNames.IHostedService
    );
    // this.pipeline = new Pipeline()
    this.config = this.services.getService(serviceNames.Config);
    registrar.registerServices();
    // this.bots = new BotCollection(services)
  }
  get node(): IMeshNode {
    return this.services.getService(serviceNames.MeshNode)
  }
  get bus(): IMessageBus {
    return this.services.getService(serviceNames.IMessageBus);
  }
  start(): Promise<unknown> {
    this._tasks = this.services.getServices<IHostedService>(
      serviceNames.IHostedService
    );
    if (this.started) return Promise.resolve();
    this.started = true;
    return Promise.all(this._tasks.map((x) => x.start()));
  }
  stop(): Promise<unknown> {
    if (!this.started) return Promise.resolve(this);
    this._tasks = this.services.getServices<IHostedService>(
      serviceNames.IHostedService
    );
    return Promise.all(this._tasks.map((x) => x.stop()));
  }
  run(token: CancellationToken) {
    token;
  }
}
