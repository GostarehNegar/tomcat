import './infrastructure/extensions';
import config from './config';
import Constants from './constants';
import { IServiceProvider, ServiceProvider } from './infrastructure/base/ServiceProvider';
//import {IMessageBus} from './infrastructure/bus/IMessageBus'

// declare module './infrastructure/bus/IMessageBus' {
//   interface IMessageBus {
//     ggg(): void;
//   }
// }

// declare module './infrastructure/bus/MessageBus' {
//   interface MessageBus {

//   }
// }


declare module './infrastructure/base/ServiceProvider' {
  interface ServiceProvider {
    getConfig(): typeof config;
  }
  interface IServiceProvider {
    getConfig(): typeof config;
  }
}
ServiceProvider.prototype.getConfig = function (): typeof config {
  return (this as IServiceProvider).getService(Constants.ServiceNames.Config);
};

