export * from './internals/HostBuilder'
export * from './internals/Host'
export * from './internals/WebHost'
export * from './internals/ExpressWebHost'
export * from './internals/BackgroundService'
import _hosts from './internals/HostCollection';

export const hosts = _hosts;