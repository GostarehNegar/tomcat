process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import http, { Server } from 'http';

import compression from 'compression';
import cors from 'cors';
import express, { Router } from 'express';


import { Constants } from '../..';
import { IServiceProvider } from '../base';

import { WebHost } from './WebHost';
http;

class ExpressWebHost extends WebHost {
  //public expressApp: express.Application;
  //public port: string | number;
  public env: string;
  public http: Server;

  constructor(name: string, services: IServiceProvider, routes?: Router[]) {
    super(name, services);
    this.expressApp = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';
    this.initializeMiddlewares();
    routes = routes || [];
    services
      .getServices<Router>(Constants.ServiceNames.Router)
      .forEach((x) => routes.push(x));
    this.initializeRoutes(routes);
    this.listener = this.expressApp.bind(this);
    //this.initializeSwagger();
    //this.initializeErrorHandling();
  }

  public listen(port?: number): Promise<unknown> {
    //this.port = process.env.PORT || 3000;
    this.port = port || process.env.PORT || 3000;
    const server = this.createServer(this.expressApp);
    //super.start()
    server.listen(this.port, () => {
      console.info(`=================================`);
      console.info(`======= ENV: ${this.env} =======`);
      console.info(`🚀 App listening on the port ${this.port}`);
      console.info(`=================================`);
    });
    return super.listen(port);
  }

  public getServer() {
    return this.expressApp;
  }

  private initializeMiddlewares() {
    //this.app.use(morgan(config.get('log.format'), { stream }));
    //this.app.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }));
    this.expressApp.use(cors());
    //this.app.use(hpp());
    //this.app.use(helmet());
    this.expressApp.use(compression());
    this.expressApp.use(express.json());
    this.expressApp.use(express.urlencoded({ extended: true }));
    // const controler = new PeerControler();

    // this.expressApp.use(async (req, res, n) => {
    //     Promise.resolve(controler.handle(req, res, n))
    //         .catch(n)
    // });
    //this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Router[]) {
    routes.forEach((route) => {
      this.expressApp.use('/', route);
    });
  }

  // private initializeSwagger() {
  //     const options = {
  //         swaggerDefinition: {
  //             info: {
  //                 title: 'REST API',
  //                 version: '1.0.0',
  //                 description: 'Example docs',
  //             },
  //         },
  //         apis: ['swagger.yaml'],
  //     };

  //     const specs = swaggerJSDoc(options);
  //     this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  // }

  // private initializeErrorHandling() {
  //     this.app.use(errorMiddleware);
  // }
}

export default ExpressWebHost;
