
import { ChildProcess, exec, ExecOptions } from 'child_process';

import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import fetch from 'node-fetch';
import { randomUUID } from 'node:crypto';
import httpsAgent, { Agent } from 'node:https';
import ping from 'ping'
import port from 'portastic'
import tcpPortUsed from 'tcp-port-used'

import config from '../base/baseconfig';

import { ILogger } from './ILogger';
import provider from './ServiceProvider'

import { Ticks, TimeEx, TimeSpan } from './TimeEx';
import { Exception, KnownExceptions } from './exception'
import { Logger } from './logger';
import fs from 'node:fs';
import Enumerable from 'linq'
import ip from 'ip';
import path from 'path';
let isDockerCached;
(provider);
export class BaseUtils {
  public test(): string {
    return 'test from 1';
  }
  public ipAddress() {
    return ip.address()
  }
  public isRedisInstalled(): boolean {
    return fs.existsSync("/usr/local/bin/redis-server")
  }
  public from<T>(source: T[]) {
    return Enumerable.from(source);
  }
  public isInDocker(): boolean {
    if (isDockerCached === undefined) {
      try {
        fs.statSync('./dockerenv')
        isDockerCached = true;
      } catch { }
      if (isDockerCached == undefined) {
        try {
          isDockerCached = fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
        } catch { }
      }
      if (isDockerCached == undefined)
        isDockerCached = false;
    }
    return isDockerCached;
  }
  public getRedisConfigFromConnectionString(connectionString: string) {
    const splitted = connectionString.split('/');
    if (splitted.length == 2) {
      return { url: "localhost", port: 6379, streamName: splitted[1] }
    }
    return { url: splitted[2].split(":")[0], port: Number(splitted[2].split(":")[1]), streamName: splitted.length == 4 ? splitted[3] : null }
  }
  public Throw_Dprecated(exception: KnownExceptions, message: string, data: unknown = null) {
    Exception.Throw_Deprecated(exception, message, data);
  }
  public Throw(message: string, category: KnownExceptions = 'unkown', name: string = null, data: unknown = null) {
    Exception.Throw(message, category, name, data);
  }
  public toException(message: string, category: KnownExceptions = 'unkown', name: string = null, data: unknown = null) {
    return Exception.create(message, category, name, data)
  }

  // public getServiceProvider() {
  //   return ServiceProvider
  // }
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
  public getClassName(o: unknown): string {
    return Object.getPrototypeOf(o).constructor.name;
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
    if (!rule) {
      return false
    }
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

  public UUID() {
    return randomUUID()
  }
  public isValidUrl(url: string) {
    return url && url.length > 1;
  }


  public findPort(min: number, max: number) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    return new Promise<number>((resolve, reject) => {
      port.find({ min: min, max: max }, function (data, err) {
        if (err) {
          reject(err)
        } else {
          const checkNext = (idx) => {
            if (idx >= data.length) {
              reject("no available ports were found")
              return
            }
            self.checkPortAvailability(data[idx]).then((res) => {
              if (res) {
                resolve(data[idx])
                return
              } else {
                checkNext(idx + 1)
              }
            }).catch(() => {
              checkNext(idx + 1)
            })
          }
          checkNext(0)
        }
      });
    })
  }
  public createDir(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`mkdir ${path}`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve("done");
        }
      });
    });
  }

  public checkPortAvailability(port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      tcpPortUsed.check(port).then((inUse) => {
        if (inUse) {
          resolve(false)
        } else {
          resolve(true)
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }
  public randomName(name: string, numberOfRandoms = 3) {
    return path.parse(name).name
      + "-" + Math.floor(Math.random() * Math.pow(10, numberOfRandoms))
      + path.parse(name).ext
  }

  public timeout<T>(promise: Promise<T>, timeout = 60000, Throw = true): Promise<T> {
    const timeoutPromise = new Promise<T>((resolve, reject) => {
      setTimeout(() => {
        (Throw ? reject("time out") : resolve(null))
      }, timeout)
    })
    return Promise.race([timeoutPromise, promise])
  }

  private _proxy: Agent;
  public getProxy(url = "https://youtube.com", max_trials = 10, dont_reject = true, interval = 5000, refersh = false): Promise<Agent> {
    return new Promise((resolve, reject) => {
      if (this._proxy != null && !refersh) {
        resolve(this._proxy);
        return;
      }
      const logger = this.getLogger('utils');
      const proxyUrl = config.internet.proxy.url;
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
  public getWorkingDirectory(folder: string) {
    let result = path.resolve("workingDirectory")
    if (!fs.existsSync(result)) {
      fs.mkdirSync(result)
    }
    if (folder && folder !== "") {
      result = path.resolve(result, folder);
      if (!fs.existsSync(result)) {
        fs.mkdirSync(result)
      }
    }
    return result;
  }
  public getTempFolder(): string {
    return this.getWorkingDirectory('tmp');
  }
  public getTempFile(n: string): string {
    return path.resolve(this.getTempFolder(), this.randomName(n, 10));

  }
  public getHomeDirectory() {
    let result = path.resolve("../")
    return result;
  }
  public execute(cmd: string, options: ExecOptions = null): Promise<{ process: ChildProcess, stdout: string, stderr: string }> {
    return new Promise<any>((resolve, reject) => {
      const result = exec(cmd, options, (err, stdout, stderr) => {
        (stdout);
        (stderr);
        if (err) {
          reject(err);
        }
        else {
          resolve({ process: result, stdout: stdout, stderr: stderr });
        }

      });

    });
  }
}

export const baseUtils = BaseUtils.instance;
