import { IncomingMessage } from 'http';

import { IRequestHeaders } from "./IRequestHeaders";

export interface IHttpRequest extends IncomingMessage {
    get headers(): IRequestHeaders; get uri(); params(key: string);
    getParams<T>(): T;
}
