import express from 'express';
import { IHost } from './IHost';
import { IHttpHandler } from "./IHttpHandler";

export interface IWebHost extends IHost {
    listen(port?: number): Promise<unknown>;
    get port(): number | string | null; expressApp: express.Application;
    close(): Promise<unknown>;
    use(
        handle: IHttpHandler,
        config?: { name: string; params: { [key: string]: string | number; }; }
    ): IWebHost;
    addPeer(url: string);
}
