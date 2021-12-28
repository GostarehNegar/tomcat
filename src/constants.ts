//import { constants as hosting_constants } from './hosting'
//(hosting_constants)
import { BaseConstants } from './infrastructure/base/baseconstants'
export const Constants = {
  Infrastructure: BaseConstants,
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
    IBot: 'IBot',
    ICock: BaseConstants.ServiceNames.IClock

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
      subscribe: 'subscribe',
      connect: 'connect',
      send: 'send',
      ping: 'ping',
      pong: 'pong'
    },
  },
};
export default Constants;
