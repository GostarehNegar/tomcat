
import { ILogger } from '../base';

import { IHttpRequest } from './IHttpRequest';
import { IHttpResponse } from "./IHttpResponse";

export interface IHttpContext {
    readonly request: IHttpRequest;
    readonly response: IHttpResponse;
    getLogger(name?: string): ILogger;
}
