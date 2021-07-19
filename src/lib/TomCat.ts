
import * as _all from './all';
import { Utils } from './all';
import _locator, { IServiceContainer } from './base/ServiceContainer';
import { Constants as _constants } from './constants';
import _config from './config'
import * as _Implementaions from './implementations';
import * as _Interfaces from './interfaces';
export import Interfaces = _Interfaces;
export import Implementaions = _Implementaions;
export import All = _all;
export class HHH {

}
class _TomCat {
    private locator: IServiceContainer;
    constructor() {
        this.locator = _locator;
        this.init();
    }
    public getService<T>(name: string, instance?: string) {
        return this.locator.getService<T>(name, instance);
    }
    private init() {
        const _locator = this.locator;
        _locator.register('IDataProvider', new _Implementaions.Data.Binance());
    }
}
(_TomCat)

namespace TomCat {
    export const services = _locator;
    export const utils = Utils.instance;
    export const constants = _constants;
    export const config = _config
    export namespace Internals {
        export import Interfaces = _Interfaces
        export import Implementaions = _Implementaions;
        export import All = _all;
    }
}

export default TomCat;
