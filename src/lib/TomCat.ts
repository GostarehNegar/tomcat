
import * as _all from './all';
import { Utils } from './all';
import { IServiceContainer, ServiceContainer } from './base/ServiceContainer';
import { Constants as _constants } from './constants';
import _config from './config'
import * as _Implementaions from './implementations';
import * as _Interfaces from './interfaces';
export import Interfaces = _Interfaces;
export import Implementaions = _Implementaions;
export import All = _all;
import { HostBuilder, IHostBuilder } from './hosting';
export class HHH {

}
class _TomCat {
    private locator: IServiceContainer;
    constructor() {
        this.locator = new ServiceContainer();
        this.init();
    }
    public getService<T>(name: string, instance?: string) {
        return this.locator.getService<T>(name, instance);
    }
    private init() {
        const _locator = this.locator;
        _locator.register('IDataProvider', new _Implementaions.Data.Binance());
    }
    public HostBilder(): IHostBuilder {
        return new HostBuilder(null);
    }
}
(_TomCat)
_Implementaions.Hosting.hosts
namespace TomCat {
    //export const services = _locator;
    export const utils = Utils.instance;
    export const constants = _constants;
    export const config = _config
    export const builder: IHostBuilder = new HostBuilder(null);
    export const hosts = _Implementaions.Hosting.hosts;
    export namespace Internals {
        export import Interfaces = _Interfaces
        export import Implementaions = _Implementaions;
        export import All = _all;
    }
}

export default TomCat;
