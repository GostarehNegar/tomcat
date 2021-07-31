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

}
export class HttpResponse extends ServerResponse implements IHttpResponse {

}