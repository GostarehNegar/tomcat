import { ILogger } from "../base/ILogger";
import redis from 'redis';
import { baseUtils } from "../base/baseUtils";
export interface RedisClientOptions extends redis.ClientOpts {
    usePublic?: boolean;
}
export class RedisClient extends redis.RedisClient {
    private logger: ILogger = baseUtils.getLogger('RedisClientEx')

    constructor(public options: RedisClientOptions) {
        super(options)
        this.on('error', (err) => {
            this.disconnectd(err)
        });
        this.on('connect', () => {
            this._connected();
        });

    }
    private _connected() {
        this.logger.info(
            `Connected to Redis. Host:'${this.options.host}'`);
    }
    private disconnectd(err: any) {
        this.logger.warn(
            `Redis Connection Lost. reason:${err}`);

    }


}


export interface IRedisClientFactory {
    createClient(options: RedisClientOptions): RedisClient;
}

