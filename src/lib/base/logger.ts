import { ILogger } from "./interfaces";


export class Logger implements ILogger {

    constructor(public name?: string) {

    }
    send(level: 'log' | 'debug' | 'info' | 'error' | 'warn', message?: any, ...params: any[]) {

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
    log(message?: any, ...params: any[]) {
        this.send('log', message, params);
    }

    private static loggers: Map<string, Logger> = new Map<string, Logger>();
    public static getLogger(name: string): ILogger {
        name = name || 'default';
        let result = this.loggers.get(name)
        if (!result) {
            result = new Logger(name);
            this.loggers.set(name, result);
        }
        return result;
    }
}
