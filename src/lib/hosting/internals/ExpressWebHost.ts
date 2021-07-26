process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import compression from 'compression';
import cors from 'cors';
import express, { Router } from 'express';
import http, { Server } from 'http'
import { IServiceProvider } from '../../base';
import Constants from '../../constants';
import { WebHost } from "./WebHost";

// import cookieParser from 'cookie-parser';
// import config from 'config';
// import helmet from 'helmet';
// import hpp from 'hpp';
// import morgan from 'morgan';
// import swaggerJSDoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';
// import { Routes } from '@interfaces/routes.interface';
// import errorMiddleware from '@middlewares/error.middleware';
// import { logger, stream } from '@utils/logger';
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
        this.http = http.createServer(this.expressApp);

        services.register(Constants.ServiceNames.HttpServer, this.http);
        this.initializeMiddlewares();
        routes = routes || [];
        services.getServices<Router>(Constants.ServiceNames.Router)
            .forEach(x => routes.push(x));
        this.initializeRoutes(routes);


        //this.initializeSwagger();
        //this.initializeErrorHandling();
    }

    public listen(port?: number): Promise<unknown> {
        //this.port = process.env.PORT || 3000;
        this.port = port || process.env.PORT || 3000;
        //super.start()
        this.http.listen(this.port, () => {
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
        //this.app.use(cookieParser());
    }

    private initializeRoutes(routes: Router[]) {
        routes.forEach(route => {
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
