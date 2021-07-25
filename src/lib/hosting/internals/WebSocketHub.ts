import WebSocket from 'ws';
import { Server } from 'http'
// import { services } from '../../index';
import { constants } from '../../interfaces';
import { IHostedService, ITransportConnectInfo } from '../../index';
import { hosts } from '../Implementations';
import { IServiceContainer } from '../../base';


const messages = constants.messages.hub;
const getConectionInfo = (client: any): ITransportConnectInfo => {
    return (client['clientinfo'] || {}) as ITransportConnectInfo
}
const setConnectionInfo = (client: unknown, info: unknown) => {
    client['clientinfo'] = info;
}
export interface WebSocktHubOptions {
    port?: number;
    server?: Server;
    path?: string
}
export class WebSocketHub implements IHostedService {
    private _ws: WebSocket.Server | null = null;
    public options: WebSocktHubOptions = null;
    constructor(private _services?: IServiceContainer, options?: WebSocktHubOptions) {
        (this._ws)
        this.options = options;
        this.options = this.options || {};
        this._services = _services || hosts.current.services;
        this.options.server =
            this.options.port
                ? undefined
                : this.options.server || this._services.getService(constants.ServiceNames.HttpServer);
        this.options.port = this.options.server ? undefined : this.options.port;


    }
    public stop(): Promise<unknown> {
        var result = new Promise<unknown>((resolve, reject) => {
            this._ws.close(err => {
                err ? reject(err) : resolve(this)

            });
        });
        return result;
    }
    private _doSend(to: WebSocket, message: any): Promise<unknown> {
        return new Promise<unknown>((resolve, reject) => {
            to.send(message, err => {
                err ? reject(err) : resolve(to);
            });

        });
    }
    public publish(from: WebSocket, message: any) {
        let promises: Promise<unknown>[] = [];
        this._ws.clients.forEach(x => {
            var sender = getConectionInfo(from).channel;
            var receiver = getConectionInfo(x).channel;
            if (sender && sender != receiver) {
                console.log("sender:", sender, "receiver:", receiver, "from:", message.payload.from)
                promises.push(this._doSend(x, message))
            }
        });
        return Promise.all(promises);

    }
    public start(): Promise<unknown> {
        this._ws = new WebSocket.Server({
            port: this.options.port,
            path: this.options.path || '/hub',
            server: this.options.server
        });
        this._ws.on('connection', ws => {
            ws.on('message', message => {
                if (!message)
                    return;
                const _message = JSON.parse(message.toString()) as { method: string, payload: any };
                console.log('received: %s', _message);
                switch (_message.method) {
                    case messages.publish:
                        console.log('publish');
                        this.publish(ws, _message)
                        // this._ws.clients.forEach(x => {
                        //     var sender = getConectionInfo(ws).channel;
                        //     var receiver = getConectionInfo(x).channel;
                        //     if (sender && sender != receiver) {
                        //         console.log("sender:", sender, "receiver:", receiver, "from:", _message.payload.from)
                        //         x.send(message)
                        //     }
                        // });
                        break;
                    case messages.connect:
                        console.log('new connection: ', _message.payload.channel)
                        setConnectionInfo(ws, _message.payload);
                        break;
                    default:
                        break;
                }

            });
        });

        return Promise.resolve();
    }

}
