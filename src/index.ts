import * as _flat from './lib/all';
import { Utils } from './lib/all';
import _locator, { IServiceLocator } from './lib/base/ServiceLocator';
import { Constants as _constants } from './lib/constants';
import * as _Implementaions from './lib/implementations';
import * as _Interfaces from './lib/interfaces';

export * as Interfaces from './lib/interfaces';
export * as Implementaions from './lib/implementations';
export * as All from './lib/all';

class lib {
  private locator: IServiceLocator;
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

namespace DEFAULT {
  export const instance = new lib();
  export const utils = Utils.instance;
  export const constants = _constants;
  export namespace Internals {
    export const Interfaces = _Interfaces;
    export const Implementaions = _Implementaions;
    export const All = _flat;
  }
}

export default DEFAULT;
