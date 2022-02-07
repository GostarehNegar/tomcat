import axios from "axios";

import { baseUtils, CancellationToken, IServiceProvider } from "../base"
import { BaseConstants } from "../base/baseconstants";
import { BackgroundService, IWebHost } from "../hosting"
export interface ApiParams {
    [key: string]: any
}
export interface ApiDefinition {
    name: string;
    params: ApiParams
    handler?: IApiHandler
}


export interface ApiContextData {
    memory?: { [key: string]: string; }
    params?: ApiParams,
    logs?: string[]
}

export interface IApiContext {
    data: ApiContextData
}

export class ApiContext {
    constructor(public data: ApiContextData) {
        data.memory = data.memory || {};
        data.logs = data.logs || [];
    }

}
export interface IApiHandler {
    (ctx: IApiContext): Promise<IApiContext>;
}

export interface PeerData extends ApiParams {
    services?: ApiDefinition[];
    url: string;

    lastSeen?: number;
}

class ServiceStatus {
    public sender: PeerData;
    public status: string;
    public peers: PeerData[];
}
export interface IApiManager {

}

export class ApiServiceNode extends BackgroundService implements IApiManager {

    public peers: PeerData[] = [];
    public self: PeerData = { url: '', services: [] }


    constructor(public serviceProvider: IServiceProvider, public services: ApiDefinition[], seed?: string) {
        super();
        serviceProvider.register('ApiServiceNode', this);
        this.self.services = services;
        if (seed)
            this.peers.push({ url: seed });

    }
    private match(pattern: ApiDefinition, def: ApiDefinition) {
        if (def.name == pattern.name) {
            for (const key in pattern.params) {
                if (def.params[key] && def.params != pattern.params) {  //!baseUtils.wildCardMatch(def.parameters[key], pattern.parameters[key])) {
                    return false
                }
            }
            return true
        }
        return false

    }
    private findService(def: ApiDefinition) {
        const result: { p: PeerData, s: ApiDefinition }[] = [];
        this.peers.forEach(x => {
            if (Array.isArray(x.services)) {
                const srv = x.services.find(s => this.match(s, def));
                if (srv)
                    result.push({ p: x, s: srv });

            }

        });
        return result;
    }
    public async call(name: string, params: ApiParams, ctx?: ApiContextData): Promise<ApiContextData> {
        ctx = ctx || { memory: {} };
        const candidates = this.findService({ name: name, params: params });
        let response: ApiContextData = null;
        const candidate = candidates.length > 0 ? candidates[0] : null;
        if (candidate) {
            const url = `${candidate.p.url}/api/${candidate.s.name}`
            ctx.params = params;
            response = await axios.post(url, ctx);
            (response);
        }
        return response;


    }
    protected get host(): IWebHost {
        return this.serviceProvider.getService<IWebHost>(BaseConstants.ServiceNames.IWebHost);
    }
    protected get app() {

        return this.serviceProvider.getService<IWebHost>(BaseConstants.ServiceNames.IWebHost)
            .expressApp;
    }
    isSelf(p: PeerData) {
        return p.url == this.self.url;
    }
    find(p: string | PeerData) {
        const url: string = typeof p === 'object' ?
            (p as PeerData).url : p;
        return this.peers.find(x => x.url === url);
    }
    protected async processPeerStatus(p: PeerData): Promise<PeerData> {
        let exisiting = this.find(p);
        if (!exisiting) {
            this.peers.push(p);
            exisiting = this.find(p);
        }
        exisiting.services = p.services;
        exisiting.lastSeen = p.lastSeen;
        return exisiting;
    }
    protected async processStatus(stat: ServiceStatus) {
        if (stat) {
            if (Array.isArray(stat.peers)) {
                for (let i = 0; i < stat.peers.length; i++) {
                    await this.processPeerStatus(stat.peers[i]);
                }
            }
        }
        if (stat.sender) {
            const peer = await this.processPeerStatus(stat.sender);
            peer.lastSeen = Date.now();
        }

    }
    getStatus(): ServiceStatus {
        return {
            status: 'ok',
            peers: this.peers,
            sender: this.self
        };
    }
    protected async run(token: CancellationToken): Promise<void> {

        while (!token.isCancelled) {
            for (let i = 0; i < this.peers.length; i++) {
                const x = this.peers[0];
                if (!this.isSelf(x)) {
                    const reply = await axios.post(x.url + '/api/stat', this.getStatus());
                    this.processStatus(reply.data);
                }

            }
            await baseUtils.delay(30);
        }


    }
    async start(): Promise<void> {
        this.self.url = `http://${baseUtils.ipAddress()}:${this.host.port}`;
        this.app.get('/api/stat', async (req, res) => {
            (req)
            res.send(this.getStatus());
        });
        this.app.post('/api/stat', async (req, res) => {
            await this.processStatus(req.body);

            res.send(this.getStatus());

        });
        if (Array.isArray(this.self.services)) {
            this.self.services.forEach(x => {
                this.app.post(`/api/${x.name}`, async (req, resp) => {
                    let ctx = req.body
                    if (x.handler && typeof x.handler === 'function') {
                        ctx = await x.handler(new ApiContext(ctx));
                    }
                    resp.send(ctx.data);
                })


            }

            )

        }
        await super.start();
    }
    async stop(): Promise<void> {
        await super.stop();

    }




}



