import { IServiceProvider } from "../../base/ServiceProvider";
import { IWebHost } from "../interfaces";
import { Host } from "./Host";
import express from 'express';
import { Server } from "http";
import Constants from "../../constants";

export class WebHost extends Host implements IWebHost {
    public port: number | string | null;
    public expressApp: express.Application = null;
    constructor(name: string, services: IServiceProvider) {
        super(name, services);

    }
    async listen(port?: number): Promise<unknown> {
        (port);
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
        await new Promise<void>((resolve, reject) => {

            var http = this.services.getService<Server>(Constants.ServiceNames.HttpServer);
            if (http) {
                http.close(err => {
                    if (err)
                        reject(err)
                    else resolve();
                });
            } else {
                resolve();
            }


        })
        //this.services.getService<Server>(Constants.ServiceNames.HttpServer).close();
        return this;

    }


}
