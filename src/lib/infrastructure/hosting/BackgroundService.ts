
//import { CancellationTokenSource } from './CancellationTokenSource';
import { CancellationToken, CancellationTokenSource } from '../base';
import { IHostedService } from './IHostedService';

export abstract class BackgroundService implements IHostedService {
  protected _token: CancellationTokenSource = new CancellationTokenSource();
  protected _task: Promise<void> | null = null;
  public name: string;
  async start() {
    this._task = this.run(this._token);
  }
  protected run(token: CancellationToken): Promise<void> {
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
