//import { constants as hosting_constants } from './hosting'
//(hosting_constants)
export const Constants = {
  ServiceNames: {
    IDataProvider: 'IDataProvider',
    IDataSource: 'IDataSource',
    IDataStore: 'IDataStore',
    IHostedService: 'IHostedService',
    IMessageBus: 'IMessageBus',
    HttpServer: 'HttpServer',
    IWebHost: 'IWebHost',
    WebSocketHub: 'WebSocketHub',
    Router: 'Router',
    Config: 'Config',
  },
  DataSources: {
    bainance: 'binance',
  },
  Coins: {
    BTC: 'BTC',
    DOGE: 'DOGE',
  },
  //hosting: hosting_constants,
  messages: {
    hub: {
      publish: 'publish',
      connect: 'connect',
      send: 'send',
    },
  },
};
export default Constants;
