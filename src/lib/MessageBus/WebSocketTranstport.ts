import WebSocket from 'ws';

import { IMessageContext, ITransportConnectInfo, IMessageTransport } from './interfaces';


export class WebSocketTransport implements IMessageTransport {
  private _ws: WebSocket | null = null;
  private _on: (message: any) => void;
  constructor() {
    this._ws;
  }
  on(handler: (message: any) => void) {
    this._on = handler;
  }
  async open(info: ITransportConnectInfo): Promise<IMessageTransport> {
    await this._open();
    this.send({ method: 'connect', payload: info });
    return this;

  }

  public async _open(): Promise<WebSocket> {
    if (this._ws) return Promise.resolve(this._ws);
    return new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket('http://localhost:8080');
      ws.on('open', () => {
        this._ws = ws;
        ws.on('message', msg => {
          //console.log("WebSocket:: message received")
          if (this._on) {

            this._on(msg)
          }
          //console.log('==================>', msg);
          (msg)


        });
        resolve(ws);
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
  private messagePayload(method: string, payload: any) {
    return {
      method: method,
      payload: payload,
    };
  }
  public send(message: any): Promise<void> {
    if (typeof message == 'object')
      message = JSON.stringify(message);
    //const _message = JSON.stringify(this.messagePayload('publish', message));
    return new Promise<void>((resolve, reject) => {
      this._open().then((ws) => {
        ws.send(message, (err) => {
          if (err) reject(err);
          else resolve();
        });
        //ws.emit('publish', message);
      });
    });
  }
  public start(id: string, device: string) {
    return this.send({ method: 'start', payload: { id: id, device: device } });

  }
  public pubish(message: IMessageContext): Promise<void> {
    return this.send(
      JSON.stringify(this.messagePayload('publish', message.message))
    );
  }
}
