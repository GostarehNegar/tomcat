import WebSocket from 'ws';

export class WebSocketHub {
  private _ws: WebSocket.Server = null;
  constructor() {
    this._ws;
  }
  public start() {
    this._ws = new WebSocket.Server({ port: 8080 });
    this._ws.on('connection', (ws) => {
      console.log(ws);
    });
  }
}
