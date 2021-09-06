
import { ILogger } from './ILogger';
import { Ticks, TimeEx, TimeSpan } from './TimeEx';
import { Logger } from './logger';
import ping from 'ping'

export class Utils {
  public test(): string {
    return 'test from 1';
  }
  public ticks(input: Date | number | TimeEx) {
    if (input instanceof TimeEx) {
      return input.ticks
    }
    if (input instanceof Date) {
      return input.getTime()
    }
    return input
  }
  public toTimeEx(ticks?: Ticks): TimeEx {
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
  public async checkInternetConnection(host = "4.2.2.4", timeOut = 10): Promise<number> {
    const res = await ping.promise.probe(host, {
      timeout: timeOut,
    });
    return res.alive ? res.time : null
  }
  public async checkVPNConnection() {
    return this.checkInternetConnection("youtube.com")
  }
  public waitForInternetConnection(interval: number = 10 * 1000): Promise<unknown> {
    const res = new Promise((resolve) => {
      setInterval(() => {
        this.checkInternetConnection().then((res) => {
          if (res) {
            resolve(res)
          }
        })
      }, interval)
    })
    return res
  }

}

export const utils = Utils.instance;
