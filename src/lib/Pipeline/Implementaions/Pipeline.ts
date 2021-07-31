import { IPipeline, IPipelineContext, IPipelineMiddleWare, IPipelineRequest, IPipelineResponse } from "../interfaces";
import http from 'http';
import { PipelineRequest } from "./PipelineRequest";
import { PipelineResponse } from "./PipelineResponse";
import { PipelineContext } from "./PipelineContext";
import { PeerCollection } from "./Peers";

//import { URL } from "url";
export class Pipeline implements IPipeline {
    private http: http.Server;
    private peers: PeerCollection = new PeerCollection();
    private middleware: IPipelineMiddleWare[] = [];
    constructor(middleware: IPipelineMiddleWare[]) {
        this.middleware = middleware;
        (this.middleware);
        (this.peers);

    }
    addPeer(url: string) {
        this.peers.add(url);
    }
    // createRequest(msg: IncomingMessage) {
    //     return new PipelineRequest(msg);
    // }
    listen(port: number) {
        this.http = http.createServer({
            IncomingMessage: PipelineRequest,
            ServerResponse: PipelineResponse
        }, async (req, res) => {

            const _req = req as any as IPipelineRequest; //this.createRequest(req);
            const _res = res as any as IPipelineResponse; //new PipelineResponse(res);
            await this.handle(_req, _res);
            if (!res.writableEnded) {
                console.warn("forwarding...")
                const x = _req.headers;
                //x["xxx-forwared-by"] = x["xxx-forwared-by"] ?? [];
                //req.se
                const _url = `http://localhost:${port}`;
                x["xxx-forwared-by"] = (x["xxx-forwared-by"] || "").concat(_url)
                //x.host = "kkk";
                var connector = http.request({
                    host: 'localhost',
                    path: req.url,
                    method: req.method,
                    headers: x,
                    port: '8081',
                }, (resp) => {
                    resp.pipe(res);
                });
                req.pipe(connector);
            }
        });
        this.http.listen(port);
    }
    close() {
        this.http?.close();
    }
    async handle(request: IPipelineRequest, res?: IPipelineResponse): Promise<IPipelineResponse> {
        (request);
        const _res = res; //|| new PipelineResponse(new ResponseHeaders());
        const context = new PipelineContext(request, _res, this);
        const _invoke = async (i, ctx: IPipelineContext) => {
            if (i == this.middleware.length)
                return Promise.resolve();
            return this.middleware[i](ctx, _ctx => _invoke(i + 1, _ctx));
        };
        await _invoke(0, context);
        return res;
    }

}
