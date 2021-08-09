import './hosting/extensions';
import { IServiceProvider, ServiceProvider } from './base/ServiceProvider';
import config from './config';
import Constants from './constants';

declare module './base/ServiceProvider' {
  interface ServiceProvider {
    getMessageBus(elseValue: any): any;
    getConfig(): typeof config;
  }
  interface IServiceProvider {
    getMessageBus(elseValue: any): any;
    getConfig(): typeof config;
  }
}

ServiceProvider.prototype.getMessageBus = function (elseValue: any): any {
  return this.isSome() ? this.value : elseValue;
};
ServiceProvider.prototype.getConfig = function (): typeof config {
  return (this as IServiceProvider).getService(Constants.ServiceNames.Config);
};
