
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import httpsAgent, { Agent } from 'node:https';
import fetch from 'node-fetch';
import ping from 'ping'

import { ILogger } from './ILogger';
import { Ticks, TimeEx, TimeSpan } from './TimeEx';
import { Logger } from './logger';
import config from '../../config';


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
  SubtractDates(first: Date | TimeEx, second: Date | TimeEx): TimeSpan {
    if (first instanceof TimeEx) {
      if (second instanceof TimeEx) {
        return TimeSpan.FromDates(new Date(first.ticks), new Date(second.ticks), true);
      }
      else {
        return TimeSpan.FromDates(new Date(first.ticks), second, true);
      }

    }
    else if (second instanceof TimeEx) {
      return TimeSpan.FromDates(first, new Date(second.ticks), true);
    }
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


  private _proxy: Agent;
  public getProxy(url = "https://youtube.com", max_trials = 10, dont_reject = true, interval = 5000, refersh = false): Promise<Agent> {
    return new Promise((resolve, reject) => {
      if (this._proxy != null && !refersh) {
        resolve(this._proxy);
      }
      const logger = this.getLogger('utils');
      const proxyUrl = config.proxy.url;
      const agent = proxyUrl && proxyUrl.length > 0
        ? new HttpsProxyAgent(proxyUrl)
        : new httpsAgent.Agent();

      let count = 0;
      const handle = setInterval(() => {
        count++;
        logger.debug(`Trying to fetch ${url} using proxy:'${proxyUrl}'. Trial:${count} of ${max_trials}}`)
        fetch(url, { agent: agent })
          .then(res => {
            (res)
            logger.info(`Successfully connected to proxy:'${proxyUrl}:' after ${count} trials`)
            clearInterval(handle)
            this._proxy = agent;
            resolve(agent)
          })
          .catch((err) => {
            (err)
          })
        if (count > max_trials) {
          clearInterval(handle);
          if (dont_reject) {
            logger.warn(
              `*** WARNING *** Failed to connect to proxy server at ${proxyUrl}:. Proxy will be disabled.`);
            resolve(null);
          }
          else {
            clearInterval(handle);
            reject(`Failed to connect to tor Proxy at '${proxyUrl}' `);

          }
        }

      }, interval);

    });

  }
}

export const baseUtils = BaseUtils.instance;
