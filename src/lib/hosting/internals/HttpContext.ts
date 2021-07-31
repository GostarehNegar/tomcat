import { IHttpContext, IHttpRequest, IHttpResponse } from "../interfaces";
import { IncomingMessage, ServerResponse } from 'http';
//import { Socket } from "node:net";
import { Socket } from 'net';
(IncomingMessage)


export class HttpContext implements IHttpContext {

    constructor(public request: IHttpRequest, public response: IHttpResponse) {

    }



}
export class HttpRequest extends IncomingMessage implements IHttpRequest {
    constructor(socket: Socket) {
        super(socket)

    }
    get uri() {
        return new URL('http://localhost' + this.url)

    }
    params(key: string) {
        return this.uri.searchParams.get(key)
    }
    getParams<T>() {
        const result = {}
        this.uri.searchParams.forEach((value, key) => {
            result[key] = value
        })
        return result as T
    }

}

export class HttpResponse extends ServerResponse implements IHttpResponse {

}