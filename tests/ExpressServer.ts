import { Router, Request, Response } from 'express';

import tomcat from '../src/index'
//import services from '../src/lib/base/ServiceContainer';
//import app from '../src/lib/hosting/ExpressWebHost'
//import http from 'http';
import child from 'child_process'
const f = child.fork('./tests/ChildProcessMain.js',);
(f)


tomcat.hosts.getHostBuilder('')
    .addServices(tomcat.Internals.Implementaions.Domain.Exchanges.addBinanceServices({ name: ';;;' }))



class IndexRoute {
    path?: string;
    router = Router();
    constructor() {
        this.router.get('/', this.index)
        this.router.get('/wiki', ({ }, res) => {
            res.send('Wiki home page');

        })
    }
    public index = (req: Request, res: Response): void => {
        try {
            (req)
            res.send("hello world");
            //res.sendStatus(200);
        } catch (error) {
            //next(error);
        }
    };

}
// var routes = [];
// routes.push(new IndexRoute().router)
// var _app = new app(services, routes);
// _app.listen();
(async () => {
    const host = tomcat
        .hosts.getHostBuilder('lklk')
        .addRouter(() => new IndexRoute().router)
        .buildWebHost();
    await host.listen(3000)
    console.log("here");
    console.log(host.port)

    host.expressApp.get('/test', ({ }, res) => {
        res.send("test page")
    });

})()
