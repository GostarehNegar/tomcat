import { ILogger } from '../interfaces';

import { TimeEx, TimeSpan } from './TimeEx';
import { Logger } from './logger';

export class Utils {
  public test(): string {
    return 'test from 1';
  }
  public toTimeEx(ticks?: number | Date): TimeEx {
    return new TimeEx(ticks);
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
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  public wildCardMatch(str, rule) {
    const escapeRegex = (str) =>
      //eslint-disable-next-line no-useless-escape
      str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
    return new RegExp(
      '^' + rule.split('*').map(escapeRegex).join('.*') + '$'
    ).test(str);
  }
}

export const utils = Utils.instance;
