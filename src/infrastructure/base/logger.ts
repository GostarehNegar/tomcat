import { ILogger } from "./ILogger";

// import { ServiceProvider } from ".";

export type LogLevel = 'log' | 'debug' | 'info' | 'error' | 'warn' | 'trace' | 'criticalInfo';
const logLevels = {
  trace: -1,
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
  criticalInfo: 5,
};
const toNumber = (l: LogLevel) => logLevels[l];
export interface ILoggerListener {
  (level: LogLevel, message?: unknown, ...params: unknown[]): void
}
export class Logger implements ILogger {
  public level: LogLevel = 'debug';
  constructor(public name?: string) { }
  criticalInfo(message?: unknown, ...params: unknown[]) {
    this.send('criticalInfo', message, params)
  }
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
  trace(message?: undefined, ...params: unknown[]) {
    this.send('trace', message, params);
  }

  send(
    level: 'log' | 'debug' | 'info' | 'error' | 'warn' | 'trace' | 'criticalInfo',
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
    Logger.listners.forEach(x => {
      x(level, message, params)
    })
    message = `${this.name}: ${message}`;
    const noParams = params.length == 1 && (params[0] as unknown[]).length == 0
    switch (level) {
      case 'trace':
        noParams ? console.trace(message) : console.trace(message, params)
        break;
      case 'log':
        noParams ? console.log(message) : console.log(message, params)
        break;
      case 'debug':
        noParams ? console.debug(message) : console.debug(message, params)
        break;
      case 'info':
        noParams ? console.info(message) : console.info(message, params)
        break;
      case 'warn':
        noParams ? console.warn(message) : console.warn(message, params)
        break;
      case 'error':
        noParams ? console.error(message) : console.error(message, params)
        break
      case 'criticalInfo':
        noParams ? console.info(message) : console.info(message, params)
        break
    }
    // ServiceProvider.instance.getBus()?.createMessage(`logger/${level}`, { message: message, params: params }).publish();
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
  public static listners: ILoggerListener[] = []
  public static registerListner(cb: ILoggerListener) {
    this.listners.push(cb)
  }
}
