import { Router, Request, Response } from 'express';

import tomcat from '../src/index'
//import services from '../src/lib/base/ServiceContainer';
//import app from '../src/lib/hosting/ExpressWebHost'
//import http from 'http';


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
const host = new tomcat.Internals.Implementaions.Hosting.HostBuilder()
    .addService(tomcat.constants.ServiceNames.Router, () => new IndexRoute().router)
    .buildWebHost();
host.listen(3000);
