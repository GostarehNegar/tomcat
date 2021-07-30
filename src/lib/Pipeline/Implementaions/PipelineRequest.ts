import { IRequestHeaders, IPipelineRequest } from "../interfaces";
import { IncomingMessage } from 'http';
import { Socket } from "net";


export class PipelineRequest extends IncomingMessage implements IPipelineRequest {
    public kkk: string = "babak";
    public body: any;
    readonly url: string;
    readonly headers: IRequestHeaders;
    constructor(socket: Socket) {
        super(socket);
        //this.url = message.url;
        //this.headers = message.headers;
    }
    get URL(): URL {

        //return new URL()
        return new URL(this.url);
    }
    async readBody(): Promise<any> {
        if (this.body != null) {
            return Promise.resolve(this.body);
        }
        return new Promise<any>((res, rej) => {
            let body = [];
            this.on('error', (err) => {
                rej(err);
            }).on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                this.body = body.toString();
                res(this.body);
            });
        });

    }

}
