import http from 'http';

import { IServiceProvider } from '../base';


class HostUtils {
  createServer(services: IServiceProvider) {
    services;
    return http.createServer();
  }
}

export default new HostUtils();
