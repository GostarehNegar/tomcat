import { CanellationToken, IHostedService } from '../interfaces';

import { CancellationTokenSource } from './CancellationTokenSource';

export abstract class BackgroundService implements IHostedService {
  protected _token: CancellationTokenSource = new CancellationTokenSource();
  protected _task: Promise<void> | null = null;
  public name: string;
  async start() {
    this._task = this.run(this._token);
  }
  protected run(token: CanellationToken): Promise<void> {
    token;
    return Promise.resolve();
  }
  async stop() {
    this._token.cancel();
    if (this._task) {
      await this._task;
    }
  }
}
