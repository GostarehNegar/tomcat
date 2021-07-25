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
  /**
   * Asynchronously waits ms miliseconds.
   * e.g await delay(3000);
   * @param ms 
   * @returns 
   */
  public delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

}

export const utils = Utils.instance;
