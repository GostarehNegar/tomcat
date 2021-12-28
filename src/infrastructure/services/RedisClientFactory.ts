import { ILogger } from "@microsoft/signalr";

import { baseUtils } from "../base";
import ServiceProvider from "../base/ServiceProvider";
import { BaseConstants } from "../base/baseconstants";

import { IClock } from "./IClock";
import { IRedisClientFactory } from "./IRedisClientFactory";
import { RedisClient } from "./RedisClient";
import { RedisClientOptions } from "./RedisClientOptions";


export class RedisClientFactory implements IRedisClientFactory {

    private static instances: RedisClient[] = [];
    private logger: ILogger = baseUtils.getLogger("RedisClientProvider");
    private clock: IClock;

    constructor() {
        (this.logger);
        this.clock = ServiceProvider.getService<IClock>(BaseConstants.ServiceNames.IClock);
        (this.clock);
    }
    createClient(options: RedisClientOptions = null): RedisClient {
        const result = new RedisClient(options);
        RedisClientFactory.instances.push(result);
        return result;
    }


}