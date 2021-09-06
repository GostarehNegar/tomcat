
import { IServiceProvider } from '../base';
import { IMessageBus } from '../bus';
import { config } from '../config';

import { CanellationToken } from './CanellationToken';
import { IHost } from './IHost';
import { IHostedService } from './IHostedService';
import { serviceNames } from './ServerBuilder';

export class Host implements IHost {
  private _tasks: IHostedService[] = [];
  public started: boolean;
  public config: typeof config;
  constructor(public name: string, public services: IServiceProvider) {
    this._tasks = this.services.getServices<IHostedService>(
      serviceNames.IHostedService
    );
    this.config = this.services.getService(serviceNames.Config);
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
  run(token: CanellationToken) {
    token;
  }
}