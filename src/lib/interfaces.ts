export * as Domain from './domain/interfaces';
export * as Messaging from './MessageBus/interfaces'
export * as Hosting from './hosting/interfaces'
import _constants from "./constants"
import _config from './config'
import * as _locator from './base/ServiceProvider'
export const config = _config
export const constants = _constants
export type IConfig = typeof _config;
