import { Server } from 'http';

import WebSocket from 'ws';

import { IServiceProvider, utils } from '../../base';
import { ITransportConnectInfo } from '../../bus';
import { constants } from '../../interfaces';
import { hosts } from '../_implementations';
import { IHostedService } from '../interfaces';

const messages = constants.messages.hub;
const getConectionInfo = (client: unknown): ITransportConnectInfo => {
  return (client['clientinfo'] || {}) as ITransportConnectInfo;
};
const setConnectionInfo = (client: unknown, info: unknown) => {
  client['clientinfo'] = info;
};
export interface WebSocktHubOptions {
  port?: number;
  server?: Server;
  path?: string;
}
export class WebSocketHub implements IHostedService {
  private _ws: WebSocket.Server | null = null;
  private log = utils.getLogger('WebSocketHub');
  public options: WebSocktHubOptions = null;
  constructor(
    private _services?: IServiceProvider,
    options?: WebSocktHubOptions
  ) {
    this._ws;
    this.options = options;
    this.options = this.options || {};
    this._services = _services || hosts.current.services;
    this.options.server = this.options.port
      ? undefined
      : this.options.server ||
      this._services.getService(constants.ServiceNames.HttpServer);
    this.options.port = this.options.server ? undefined : this.options.port;
  }
  public stop(): Promise<unknown> {
    const result = new Promise<unknown>((resolve, reject) => {
      this._ws.close((err) => {
        err ? reject(err) : resolve(this);
      });
    });
    return result;
  }
  private _doSend(to: WebSocket, message: unknown): Promise<unknown> {
    if (typeof message === 'object') message = JSON.stringify(message);
    return new Promise<unknown>((resolve, reject) => {
      to.send(message, (err) => {
        err ? reject(err) : resolve(to);
      });
    });
  }
  public publish(from: WebSocket, message: any) {
    const promises: Promise<unknown>[] = [];
    this._ws.clients.forEach((x) => {
      const sender = getConectionInfo(from).endpoint;
      const receiver = getConectionInfo(x).endpoint;
      if (sender && sender != receiver) {
        this.log.log(
          'sender:',
          sender,
          'receiver:',
          receiver,
          'from:',
          message.payload.from
        );
        promises.push(this._doSend(x, JSON.stringify(message)));
      }
    });
    return Promise.all(promises);
  }
  public start(): Promise<unknown> {
    this._ws = new WebSocket.Server({
      port: this.options.port,
      path: this.options.path || '/hub',
      server: this.options.server,
    });
    this._ws.on('connection', (ws) => {
      ws.on('message', (message) => {
        if (!message) return;
        const _message = JSON.parse(message.toString()) as {
          method: string;
          payload: any;
        };
        this.log.log('received: %s', _message);
        switch (_message.method) {
          case messages.publish:
            this.publish(ws, _message);
            break;
          case messages.connect:
            this.log.log('new connection: ', _message.payload.channel);
            setConnectionInfo(ws, _message.payload);
            break;
          default:
            break;
        }
      });
    });

    return Promise.resolve();
  }
}
