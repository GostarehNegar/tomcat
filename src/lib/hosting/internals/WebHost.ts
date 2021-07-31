import { IServiceProvider } from "../../base/ServiceProvider";
import { IHttpContext, IHttpHandler, IWebHost } from "../interfaces";
import { Host } from "./Host";
import express from 'express';

import Constants from "../../constants";
import http from 'http'
import { HttpContext, HttpRequest, HttpResponse } from "./HttpContext";
import { Peer, PeerCollection } from "./Peers";

export class WebHost extends Host implements IWebHost {
    public port: number | string | null;
    public expressApp: express.Application = null;
    public httpServer: http.Server;
    public handlers: IHttpHandler[] = [];
    public listener: http.RequestListener;
    public peers: PeerCollection = new PeerCollection();
    constructor(name: string, services: IServiceProvider) {
        super(name, services);
    }
    addPeer(url: string) {
        (url)
        this.peers.add(url);
    }
    jjj(): void {
        throw new Error("Method not implemented.");
    }
    protected _listener(_req: any, _res: any): Promise<void> {
        return Promise.resolve();

    }
    protected createContext(req: any, res: any): HttpContext {
        return new HttpContext(req, res);


    }
    async listen(port?: number): Promise<unknown> {
        (port);
        this.port = port;
        this.peers.setSelf(this.getHostUrl());
        await this.start();
        return this;
    }
    async stop(): Promise<unknown> {
        await super.stop();
        await this.close();
        return this;
    }
    async close(): Promise<unknown> {
        //await this.stop();
        this.httpServer?.close();
        // await new Promise<void>((resolve, reject) => {
        //     var http = this.services.getService<Server>(Constants.ServiceNames.HttpServer);
        //     if (http) {
        //         http.close(err => {
        //             if (err)
        //                 reject(err)
        //             else resolve();
        //         });
        //     } else {
        //         resolve();
        //     }
        // })
        //this.services.getService<Server>(Constants.ServiceNames.HttpServer).close();
        return this;

    }


    public createServer(listener?: http.RequestListener) {
        if (this.httpServer != null) {
            return this.httpServer;
        }
        this.listener = (listener || this.listener).bind(this);
        this.httpServer = http.createServer(
            {
                IncomingMessage: HttpRequest,
                ServerResponse: HttpResponse
            }, listener || this.listener);
        this.services.register(Constants.ServiceNames.HttpServer, this.httpServer);
        return this.httpServer;
    }

    use(handler: IHttpHandler, config?: { name: string } | string): IWebHost {

        const _config = config
            ? typeof config === 'string'
                ? { name: config }
                : config
            : { name: handler.name || 'noname' };
        let _handler = handler;
        if (handler.length == 1) {
            _handler = async (ctx, n) => {
                const result = await handler(ctx, n);
                if (ctx.response.writableEnded) {
                    return result;
                }
                return await n(ctx);
            }
        }
        (_handler as any).config = _config;
        this.handlers.push(_handler);
        return this;
    }


    getHostUrl(): string {
        return `http://localhost:${this.port}`;
    }
    private forwardToPeer(context: IHttpContext, peer: Peer): Promise<unknown> {
        const req = context.request;
        const res = context.response;
        const x = req.headers;
        //x["xxx-forwared-by"] = x["xxx-forwared-by"] ?? [];
        //req.se
        var chain = new PeerCollection(req.headers["x-forward-chain"])
            .add(this.getHostUrl())
            .toString();
        var peers = new PeerCollection(req.headers["x-forward-peers"])
            .add(this.peers)
            .add(this.getHostUrl())
            .toString();
        req.headers["x-forward-chain"] = chain;
        req.headers["x-forward-peers"] = peers;
        var connector = http.request({
            host: peer.uri.hostname,
            path: req.url,
            method: req.method,
            headers: x,
            port: peer.uri.port,
        }, (resp) => {
            resp.pipe(res);
            res.statusCode = resp.statusCode;
        });
        req.pipe(connector);

        return Promise.resolve({});

    }
    protected async forward(context: IHttpContext): Promise<boolean> {
        const peer = this.peers.getPeer(context);
        if (peer != null) {

            await this.forwardToPeer(context, peer)
            return true;
        }
        else {
            context.response.statusCode = 404;
            context.response.end();
            return false;

        }

    }



}
