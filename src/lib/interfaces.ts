export * as Data from './data/interfaces';
export * as Messaging from './MessageBus/interfaces'
import _constants from "./constants"
import _config from './config'
import * as _locator from './base/ServiceContainer'
export const config = _config
export const constants = _constants
export const services = _locator.default;


// export namespace DEFUALT {
//     export import Interfaces = _Interfaces
//     export import Implementaions = _Implementaions;
//     export import All = _all;
// }
// export default DEFUALT;