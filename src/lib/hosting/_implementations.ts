export * from './implementations/HostBuilder';
export * from './implementations/Host';
export * from './implementations/WebHost';
export * from './implementations/ExpressWebHost';
export * from './implementations/BackgroundService';
import _hosts from './implementations/HostCollection';

export const hosts = _hosts;
