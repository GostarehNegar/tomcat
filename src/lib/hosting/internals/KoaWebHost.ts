import http, { Server } from 'http';
import koa from 'koa'
import { IServiceProvider } from '../../base/ServiceProvider';
import { WebHost } from './WebHost';


export class KoaWebHost extends WebHost {
    public koaApp: koa;
    public env: string;
    constructor(name: string, services: IServiceProvider) {
        super(name, services);
        this.koaApp = new koa();
        this.env = process.env.NODE_ENV || 'development';
        this.listener = this.koaApp.callback().bind(this);


        //http.createServer(app.callback()).listen(3000);
    }
    public listen(port?: number): Promise<unknown> {
        //this.port = process.env.PORT || 3000;
        this.port = port || process.env.PORT || 3000;
        const server = this.createServer(this.koaApp.callback());
        //super.start()
        server.listen(this.port, () => {
            console.info(`=================================`);
            console.info(`======= ENV: ${this.env} =======`);
            console.info(`🚀 App listening on the port ${this.port}`);
            console.info(`=================================`);
        });
        return super.listen(port);
    }
}