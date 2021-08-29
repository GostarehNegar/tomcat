import { ServiceProvider } from '../base/ServiceProvider';

//import { IHostBuilder } from './interfaces'
import { HostBuilder } from './HostBuilder';
import { WebHost } from './WebHost';

declare module '../base/ServiceProvider' {
  interface ServiceProvider {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMessageBus2(elseValue: any): any;
  }
}

declare module './IHostBuilder' {
  interface IHostBuilder {
    kkk(): void;
  }
}
declare module './IWebHost' {
  interface IWebHost {
    jjj(): void;
  }
}

declare module './HostBuilder' {
  interface HostBuilder {
    kkk(): void;
  }
}
declare module './WebHost' {
  interface WebHost {
    jjj(): void;
  }
}

HostBuilder.prototype.kkk = function () {
  return 0
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
ServiceProvider.prototype.getMessageBus2 = function (elseValue: any): any {
  return this.isSome() ? this.value : elseValue;
};
WebHost.prototype.jjj = function () {
  return 0
};
