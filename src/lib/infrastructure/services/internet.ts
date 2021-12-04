import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import httpsAgent, { Agent } from 'node:https';
import { Utils } from '../../common';
import { baseUtils, CancellationToken, ILogger } from '../base';
import fetch from 'node-fetch';
import cfg from '../base/baseconfig';
import { BackgroundService } from '../hosting';
import { IInternetService } from './IInternetService';
const config = cfg.internet;


export class Internetservice extends BackgroundService implements IInternetService {
    private _proxy: Agent;
    private _logger: ILogger;
    constructor() {
        super();
        this._logger = Utils.instance.getLogger("InternetService");

    }
    public getAgent(url = "https://youtube.com", max_trials = 10, dont_reject = true, interval = 5000, refersh = false): Promise<Agent> {
        return new Promise((resolve, reject) => {
            if (this._proxy != null && !refersh) {
                resolve(this._proxy);
                return;
            }
            const logger = this._logger;
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
    async run(token: CancellationToken) {
        while (!token.isCancelled) {
            await baseUtils.delay(5 * 60 * 1000);
            await this.getAgent(undefined, undefined, undefined, undefined, true);
        }


    }
}