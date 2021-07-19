import { ILogger } from './interfaces';
import { Logger } from './logger';
import { TimeSpan } from './TimeEx';

export class Utils {
  public test(): string {
    return 'test from 1';
  }
  public toDate() {
    return new Date();
  }
  SubtractDates(first: Date, second: Date): TimeSpan {
    return TimeSpan.FromDates(first, second, true);
  }
  public static get instance() {
    return new Utils();
  }
  public getLogger(name?: string): ILogger {
    return Logger.getLogger(name);

  }
}
export const utils = Utils.instance;
