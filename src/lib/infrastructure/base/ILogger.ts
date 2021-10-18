import { LogLevel } from ".";

export interface ILogger {
    log(message?: unknown, ...params: unknown[]);
    info(message?: unknown, ...params: unknown[]);
    warn(message?: unknown, ...params: unknown[]);
    error(message?: unknown, ...params: unknown[]);
    debug(message?: unknown, ...params: unknown[]);
    level: LogLevel;
}
