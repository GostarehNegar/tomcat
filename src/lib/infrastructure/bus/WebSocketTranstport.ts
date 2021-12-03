import WebSocket from 'ws';
import { ITransportMessageHandler } from '.';
//import { Constants } from '../../constants';
import topics from './Topics';


import { config } from '../../config';

import { IMessageContext } from './IMessageContext';
import { IMessageTransport } from './IMessageTransport';
import { IEndpointInfo } from './IEndpointInfo';
import { ILogger } from '../base';
import { Utils } from '../../common';

//import { ITransportConnectInfo } from './ITransportConnectInfo';
const messages = topics.Internal;


export class WebSocketTransport implements IMessageTransport {
  private _ws: WebSocket | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _on: ITransportMessageHandler;
  public readonly name = 'websocket';
  private _logger: ILogger;
  public _config = config.messaging.transports.websocket;
  constructor(
    cf?: (c: typeof config.messaging.transports.websocket) => void,
    cfg?: typeof config.messaging.transports.websocket
  ) {
    this._config = cfg || config.messaging.transports.websocket;
    if (cf) cf(this._config);
    this._ws;
    this._logger = Utils.instance.getLogger("Bus.Transport.WebSocket")
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(handler: ITransportMessageHandler) {
    this._on = handler;
  }
  async open(handler: ITransportMessageHandler, info: IEndpointInfo): Promise<IMessageTransport> {
    this._on = handler;
    await this._open();
    this.send({ method: messages.connect, payload: info })
      .then()
      .catch(err => {
        this._logger.error(
          `An error occured while trying to connect WebSocketTransport. Err:'${err}'`);
      });
    return this;
  }

  public pong(data: IEndpointInfo) {
    this.send({ method: messages.pong, payload: data })
      .catch(err => {
        this._logger.error(
          `An error occured while trying to pong WebSocketServer. Err:'${err}'`);

      });
  }
  public isConnected() {
    return this._ws != null && this._ws.readyState == this._ws.OPEN;
  }
  public async _open(): Promise<WebSocket> {
    if (this._ws) return Promise.resolve(this._ws);
    return new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(this._config.url);
      ws.on('open', () => {
        this._ws = ws;
        ws.on('message', (msg) => {
          if (this._on) {
            this._on(this, msg);
          }
        });
        resolve(ws);
      });
      ws.on('close', (c, r) => {
        this._logger.warn(
          `WebSocket Closed code:${c}. Reason:${r}`);

      });
      ws.on('ping', msg => {
        ws.pong(msg);
      });
      ws.on('error', (err) => {
        reject(err);
      });
    });
  }
  public close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._open().then((ws) => {
        ws.close();
        resolve();
        reject;
      });
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private messagePayload(method: string, payload: any) {
    return {
      method: method,
      payload: payload,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public send(message: any): Promise<void> {
    if (typeof message == 'object') message = JSON.stringify(message);
    //const _message = JSON.stringify(this.messagePayload('publish', message));
    return new Promise<void>((resolve, reject) => {
      this._open().then((ws) => {
        //console.warn(message)
        ws.send(message, (err) => {
          if (err) reject(err);
          else resolve();
        });
        //ws.emit('publish', message);
      });
    });
  }
  // public start(id: string, device: string) {
  //   return this.send({ method: 'start', payload: { id: id, device: device } });
  // }
  public pubish(message: IMessageContext): Promise<void> {
    return this.send(
      JSON.stringify(this.messagePayload(messages.publish, message.message)))
      .catch(err => {
        this._logger.error(
          `An error occured while trying to publish thru WebSocketTrnasport. ` +
          `Error:${err}`)

      });
  }
  public subscribe(topic: string): Promise<void> {
    if (!this.isConnected()) {
      return Promise.resolve();
    }
    return this.send(
      JSON.stringify(this.messagePayload(messages.subscribe, { topic: topic }))
    )
      .catch(err => {
        this._logger.error(
          `An error occured while trying to Subscribe thru WebSocketTransport. ` +
          `Error: ${err}`)

      });
  }
}
