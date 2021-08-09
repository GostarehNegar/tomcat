import { ServiceProvider } from '../base/ServiceProvider';

//import { IHostBuilder } from './interfaces'
import { HostBuilder } from './implementations/HostBuilder';
import { WebHost } from './implementations/WebHost';

declare module '../base/ServiceProvider' {
  interface ServiceProvider {
    getMessageBus2(elseValue: any): any;
  }
}

declare module './interfaces/IHostBuilder' {
  interface IHostBuilder {
    kkk(): void;
  }
}
declare module './interfaces/IWebHost' {
  interface IWebHost {
    jjj(): void;
  }
}

declare module './implementations/HostBuilder' {
  interface HostBuilder {
    kkk(): void;
  }
}
declare module './implementations/WebHost' {
  interface WebHost {
    jjj(): void;
  }
}

HostBuilder.prototype.kkk = function () {
  return 0
};
ServiceProvider.prototype.getMessageBus2 = function (elseValue: any): any {
  return this.isSome() ? this.value : elseValue;
};
WebHost.prototype.jjj = function () {
  return 0
};
