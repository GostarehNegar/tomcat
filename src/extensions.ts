import './infrastructure/extensions';
import config from './config';
import Constants from './constants';
import { IServiceProvider, ServiceProvider } from './infrastructure/base/ServiceProvider';

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
