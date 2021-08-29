import { IncomingMessage, ServerResponse } from 'http';
//import { Socket } from "node:net";
import { Socket } from 'net';

import { ILogger, Logger } from '../base';

import { IHttpContext } from './IHttpContext';
import { IHttpHandler } from './IHttpHandler';
import { IHttpRequest } from './IHttpRequest';
import { IHttpResponse } from './IHttpResponse';

IncomingMessage;

export class HttpContext implements IHttpContext {
  private _handler: IHttpHandler;
  constructor(public request: IHttpRequest, public response: IHttpResponse) { }
  getLogger(name?: string): ILogger {
    return Logger.getLogger(name);
  }
  get handler(): IHttpHandler {
    return this._handler;
  }
  setCurrentHandler(handler: IHttpHandler) {
    this._handler = handler;
  }
}
export class HttpRequest extends IncomingMessage implements IHttpRequest {
  constructor(socket: Socket) {
    super(socket);
  }
  get uri() {
    return new URL('http://localhost' + this.url);
  }
  params(key: string) {
    return this.uri.searchParams.get(key);
  }
  getParams<T>() {
    const result = {};
    this.uri.searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result as T;
  }
}

export class HttpResponse extends ServerResponse implements IHttpResponse { }
