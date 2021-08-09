import { ILogger } from '../_interfaces';

export type LogLevel = 'log' | 'debug' | 'info' | 'error' | 'warn';
const logLevels = {
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
};
const toNumber = (l: LogLevel) => logLevels[l];

export class Logger implements ILogger {
  public level: LogLevel = 'debug';
  constructor(public name?: string) {}
  info(message?: unknown, ...params: unknown[]) {
    this.send('info', message, params);
  }
  warn(message?: unknown, ...params: unknown[]) {
    this.send('warn', message, params);
  }
  error(message?: unknown, ...params: unknown[]) {
    this.send('error', message, params);
  }
  log(message?: undefined, ...params: unknown[]) {
    this.send('log', message, params);
  }
  debug(message?: undefined, ...params: unknown[]) {
    this.send('debug', message, params);
  }
  send(
    level: 'log' | 'debug' | 'info' | 'error' | 'warn',
    message?: unknown,
    ...params: unknown[]
  ) {
    if (Logger.disabled) return;
    if (toNumber(level) < toNumber(Logger.level)) {
      return;
    }
    if (toNumber(level) < toNumber(this.level)) {
      return;
    }
    message = `${this.name}: ${message}`;
    switch (level) {
      case 'log':
        console.log(message, params);
        break;
      case 'debug':
        console.debug(message, params);
        break;
      case 'info':
        console.info(message, params);
        break;
      case 'warn':
        console.warn(message, params);
        break;
      case 'error':
        console.error(message, params);
    }
  }

  private static loggers: Map<string, Logger> = new Map<string, Logger>();
  public static getLogger(name: string): ILogger {
    name = name || 'default';
    let result = this.loggers.get(name);
    if (!result) {
      result = new Logger(name);
      this.loggers.set(name, result);
    }
    return result;
  }
  public static disabled = false;
  public static level: LogLevel = 'info';
}
