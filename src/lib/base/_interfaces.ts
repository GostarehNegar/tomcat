import * as container from './ServiceProvider';

export interface ILogger {
  log(message?: unknown, ...params: unknown[]);
  info(message?: unknown, ...params: unknown[]);
  warn(message?: unknown, ...params: unknown[]);
  error(message?: unknown, ...params: unknown[]);
  debug(message?: unknown, ...params: unknown[]);
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export import IServiceProvider = container.IServiceProvider;
