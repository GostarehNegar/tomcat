import ioredis from 'ioredis';

import { ILogger } from "../../base/ILogger";
import { baseUtils } from "../../base/baseUtils";

import { RedisClientOptions } from "./RedisClientOptions";



export class RedisClient extends ioredis {
    private logger: ILogger = baseUtils.getLogger('RedisClientEx');
    private _connected: boolean;


    constructor(_options: RedisClientOptions) {
        super(_options || undefined);
        this.on('error', (err) => {
            this._connected = false;
            this.logger.warn(
                `Redis Connection Lost. reason:${err}`);
        });
        this.on('connect', () => {
            this._connected = true;
            this.logger.info(
                `Connected to Redis. Host:'${this.options.host}'`);
        });

    }
    Duplicate(): RedisClient {
        return new RedisClient(this.options);
    }
    async ensureConnection(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this._connected) {
                resolve(true)
                return;
            }
            this.on('connect', () => {
                this._connected = true;
                resolve(true);
            });
            this.on('error', () => {
                this._connected = true;
                reject(false);
            });
            this.connect()
                .then(() => { })
                .catch(err => {
                    (err)
                });
        });



    }


}
