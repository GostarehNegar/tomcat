
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import fetch from 'node-fetch';
import ping from 'ping'

import { ILogger } from './ILogger';
import { Ticks, TimeEx, TimeSpan } from './TimeEx';
import { Logger } from './logger';


export class BaseUtils {
  public test(): string {
    return 'test from 1';
  }
  public ticks(input: Date | number | TimeEx | string): number {
    if (input instanceof TimeEx) {
      return input.ticks
    }
    if (input instanceof Date) {
      return input.getTime()
    }
    if (typeof input == "string") {
      const d = new Date(input)
      if (d.toISOString() == input)
        return d.getTime();
      return parseInt(input)
    }
    return input
  }
  public toTimeEx(ticks?: Ticks): TimeEx {
    return new TimeEx(this.ticks(ticks));

  }
  public parseIsoDate(input?: string): Date {
    return TimeEx.parseIsoDate(input);
  }
  public toDate() {
    return new Date();
  }
  SubtractDates(first: Date, second: Date): TimeSpan {
    return TimeSpan.FromDates(first, second, true);
  }
  public static get instance() {
    return new BaseUtils();
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


  public randomName(name: string, numberOfRandoms = 3) {
    return name + "-" + Math.floor(Math.random() * Math.pow(10, numberOfRandoms))
  }
  public getProxy(url = "https://youtube.com", max_trials = 10, dont_reject = true, interval = 5000): Promise<HttpsProxyAgent> {
    return new Promise((resolve, reject) => {
      const logger = this.getLogger('utils');
      const host = process.env.tor_host || 'tor'
      const port = 8118;
      const proxyAgent = new HttpsProxyAgent(`http://${host}:${port}`);
      let count = 0;
      const handle = setInterval(() => {
        count++;
        logger.debug(`Trying to fetch ${url} using proxy:${host}:${port}. Trial:${count} of ${max_trials}}`)
        fetch(url, { agent: proxyAgent })
          .then(res => {
            (res)
            logger.info(`Successfully connected to proxy:'${host}:${port}' after ${count} trials`)
            clearInterval(handle)
            resolve(proxyAgent)
          })
          .catch((err) => {
            (err)
          })
        if (count > max_trials) {
          clearInterval(handle);
          if (dont_reject) {
            logger.warn(
              `*** WARNING *** Failed to connect to proxy server at ${host}:${port}. Proxy will be disabled.`);
            resolve(null);
          }
          else {
            reject(`Failed to connect to tor Proxy at ${host}:${port} `);

          }
        }

      }, interval);

    });

  }
}

export const baseUtils = BaseUtils.instance;
