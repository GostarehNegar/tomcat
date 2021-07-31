import { IPipelineResponse, IResponseHeaders } from "../interfaces";
import { IncomingMessage, ServerResponse } from 'http';


export class PipelineResponse extends ServerResponse implements IPipelineResponse {
    constructor(req: IncomingMessage) {
        super(req);
    }
    get headers(): IResponseHeaders {

        return this.getHeaders();
    }
}
