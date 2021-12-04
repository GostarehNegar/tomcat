import { ILogger } from "@microsoft/signalr";
import { baseUtils } from "../base";

import ServiceProvider from "../base/ServiceProvider";
import { IClock } from "./IClock";
import { BaseConstats } from "../base/baseconstants";
import { IRedisClientFactory, RedisClient, RedisClientOptions } from "./IRedisClientFactory";


export class RedisClientFactory implements IRedisClientFactory {

    private static instances: RedisClient[] = [];
    private logger: ILogger = baseUtils.getLogger("RedisClientProvider");
    private clock: IClock;

    constructor() {
        (this.logger);
        this.clock = ServiceProvider.getService<IClock>(BaseConstats.ServiceNames.IClock);
        (this.clock);
    }
    createClient(options: RedisClientOptions = null): RedisClient {
        const result = new RedisClient(options);
        RedisClientFactory.instances.push(result);
        return result;
    }

}