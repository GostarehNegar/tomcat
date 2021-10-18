
import { Utils } from './common';
import * as _Domain from './domain'
import * as _Infrastructure from "./infrastructure"

import * as _all from './';

namespace TomCat {
  export const utils = Utils.instance
  export const constants = _all.constants;
  export const config = _all.Config.config;
  //export const builder: _Interfaces.Hosting.IHostBuilder = new _Implementaions.Hosting.HostBuilder(null);

  export const hosts = _Infrastructure.Hosting.hosts;
  // export const Bot = _all.Bot;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Infrastructure = _Infrastructure
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Domain = _Domain
  // export import Index = _all;

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
