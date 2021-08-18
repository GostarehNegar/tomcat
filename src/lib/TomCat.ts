import * as _Implementaions from './implementations';
import * as _Interfaces from './interfaces';

import * as _all from './';
export import Interfaces = _Interfaces;
export import Implementaions = _Implementaions;
export import Index = _all;

namespace TomCat {
  export const utils = _Implementaions.Base.Utils.instance;
  export const constants = _Interfaces.constants;
  export const config = _Interfaces.config;
  //export const builder: _Interfaces.Hosting.IHostBuilder = new _Implementaions.Hosting.HostBuilder(null);
  export const hosts = _Implementaions.Hosting.hosts;
  export const Bot = _Implementaions.Domain.Bot
  export namespace Internals {
    export import Interfaces = _Interfaces;
    export import Implementaions = _Implementaions;
    export import Index = _all;
  }
}
//const tomcat = TomCat
export default TomCat;

// class _TomCat {
//     private locator: IServiceContainer;
//     constructor() {
//         this.locator = new ServiceContainer();
//         this.init();
//     }
//     public getService<T>(name: string, instance?: string) {
//         return this.locator.getService<T>(name, instance);
//     }
//     private init() {
//         const _locator = this.locator;
//         _locator.register('IDataProvider', new _Implementaions.Data.Binance());
//     }
//     public HostBilder(): IHostBuilder {
//         return new HostBuilder(null);
//     }
// }
// (_TomCat)
