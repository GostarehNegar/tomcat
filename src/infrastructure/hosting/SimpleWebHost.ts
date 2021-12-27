
import { IServiceProvider } from '../base';

import { HttpContext } from './HttpContext';
import { IHttpRequest } from './IHttpRequest';
import { IHttpResponse } from './IHttpResponse';
import { PeerCollection } from './Peers';
import { WebHost } from './WebHost';

export class LightWebHost extends WebHost {
  constructor(name: string, services: IServiceProvider) {
    super(name, services);
    this.listener = this._listener.bind(this);
  }
  async _listener(req: IHttpRequest, res: IHttpResponse): Promise<void> {
    //await super._listener(req, res);
    const _req = req; // as any as IHttpRequest; //this.createRequest(req);
    const _res = res; // as any as IHttpResponse; //new PipelineResponse(res);
    _req;
    _res;
    const context = this.createContext(_req, _res);
    this.peers.add(
      new PeerCollection(_req.headers['x-forward-peers']).toString()
    );
    this.peers.add(
      new PeerCollection(_req.headers['x-forward-chain']).toString()
    );
    // if (peers.length > 0) {
    //     console.log('')
    // }
    await this.handle(context);
    if (!res.writableEnded) {
      const success = await this.forward(context);
      if (!success) {
        // _res.statusCode = 404;
        // _res.end();
      }
    }
    // let gg = context.response as any;
    // if (gg.babak)
    //     _res.statusCode = context.response.statusCode;
  }
  listen(port: number, hosts: string[]): Promise<unknown> {
    (hosts);
    const server = this.createServer(this.listener);
    const host = hosts && hosts.length > 0 ? hosts[0] : undefined;
    //server.listen(port, host);
    server.listen(port, host, undefined, () => {
      console.info(`=================================`);
      console.info(`🚀 App listening on the port ${this.port}`);
      console.info(`=================================`);
    });
    return super.listen(port);
  }
  private async handle(ctx: HttpContext): Promise<unknown> {
    const _invoke = async (i) => {
      if (i == this.handlers.length) return Promise.resolve();
      ctx.setCurrentHandler(this.handlers[i]);
      return this.handlers[i](ctx, () => _invoke(i + 1));
    };
    await _invoke(0);
    return;
  }
}
