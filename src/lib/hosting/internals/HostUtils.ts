import { IServiceProvider } from "../../base";
import http from 'http';

class HostUtils {

    createServer(services: IServiceProvider) {
        (services)
        return http.createServer();
    }
}

export default new HostUtils();