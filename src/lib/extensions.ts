import './infrastructure/extensions';
import config from './config';
import Constants from './constants';
import { IServiceProvider, ServiceProvider } from './infrastructure/base/ServiceProvider';

declare module './infrastructure/base/ServiceProvider' {
  interface ServiceProvider {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getConfig(): typeof config;
  }
  interface IServiceProvider {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getConfig(): typeof config;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
ServiceProvider.prototype.getConfig = function (): typeof config {
  return (this as IServiceProvider).getService(Constants.ServiceNames.Config);
};
