export * as Domain from './domain/_interfaces';
export * as Messaging from './bus/_interfaces';
export * as Hosting from './hosting/_interfaces';
//import * as _locator from './base/ServiceProvider';
import _config from './config';
import _constants from './constants';
export const config = _config;
export const constants = _constants;
export type IConfig = typeof _config;
