import { ServiceProvider } from '../base/ServiceProvider';
//import { IHostBuilder } from './interfaces'
import { HostBuilder } from './internals/HostBuilder';
import { WebHost } from './internals/WebHost';


declare module '../base/ServiceProvider' {
    interface ServiceProvider {
        getMessageBus2(elseValue: any): any;
    }
}

declare module './interfaces' {
    interface IHostBuilder {
        kkk(): void;
    }
    interface IWebHost {
        jjj(): void;
    }
}
declare module './internals/HostBuilder' {
    interface HostBuilder {
        kkk(): void;
    }
}
declare module './internals/WebHost' {
    interface WebHost {
        jjj(): void;
    }
}

HostBuilder.prototype.kkk = function () {

}
ServiceProvider.prototype.getMessageBus2 = function (elseValue: any): any {
    return this.isSome() ? this.value : elseValue;
}
WebHost.prototype.jjj = function () {

}