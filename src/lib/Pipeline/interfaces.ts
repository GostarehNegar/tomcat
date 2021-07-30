import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";

export type RequestMethods = 'GET' | 'POST' | 'PUBLISH';
type kkk = (context: IPipelineContext) => Promise<any>;
export interface IPipelineMiddleWare {
    (context: IPipelineContext, next: kkk): Promise<any>;
}
export interface IPipeline {

    handle(request: IPipelineRequest, res?: IPipelineResponse): Promise<IPipelineResponse>;
    listen(port: number);
    addPeer(url: string);
    close();
    //createRequest(methods: RequestMethods, url: string, headers: IHeaders, paras: any, body: any);
}
export interface IPipelineBuilder {
    use(m: IPipelineMiddleWare): IPipelineBuilder;
    build(): IPipeline;
}

export interface IPipelineContext {
    readonly req: IPipelineRequest;
    readonly res: IPipelineResponse;
    readonly pipe: IPipeline;

}
export interface IPipelineRequest {
    get URL(): URL;
    readonly url: string;
    readonly headers: IRequestHeaders;
    readBody(): Promise<any>;
}
export interface IPipelineResponse {
    write(chunk: any);
    end();


}
export interface IPeer {

}
export interface IPeerCollection {

}
export interface IPipelineHost {

}


export interface IRequestHeaders extends IncomingHttpHeaders {
    'babak'?: string | undefined;
    'xxx-forwared-by'?: string | string[] | undefined;
    //addForwarder(url: string):string;



}
export interface IResponseHeaders extends OutgoingHttpHeaders {

}