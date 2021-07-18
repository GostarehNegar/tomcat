export * from './lib/TomCat'
import tomcat from './lib/TomCat'
export default tomcat;


// import * as _all from './lib/all';
// import { Utils } from './lib/all';
// import _locator, { IServiceLocator } from './lib/base/ServiceLocator';
// import { Constants as _constants } from './lib/constants';
// import _config from './lib/config'
// import * as _Implementaions from './lib/implementations';
// import * as _Interfaces from './lib/interfaces';
// export import Interfaces = _Interfaces;
// export import Implementaions = _Implementaions;
// export import All = _all;



// class lib {
//   private locator: IServiceLocator;
//   constructor() {
//     this.locator = _locator;
//     this.init();
//   }
//   public getService<T>(name: string, instance?: string) {
//     return this.locator.getService<T>(name, instance);
//   }
//   private init() {
//     const _locator = this.locator;
//     _locator.register('IDataProvider', new _Implementaions.Data.Binance());
//   }
// }

// namespace TomCat {
//   export const instance = new lib();
//   export const utils = Utils.instance;
//   export const constants = _constants;
//   export const config = _config
//   export namespace Internals {
//     export import Interfaces = _Interfaces
//     export import Implementaions = _Implementaions;
//     export import All = _all;
//   }
// }

// export default TomCat;
