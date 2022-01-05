
import utils from "../../../common/Domain.Utils";
import { baseUtils, ILogger } from "../../base";


import { IRedisClientFactory } from "./IRedisClientFactory";
import { RedisClient } from "./RedisClient";
import { RedisClientOptions } from "./RedisClientOptions";



export class RedisClientFactory implements IRedisClientFactory {

    private static instances: RedisClient[] = [];
    private logger: ILogger = baseUtils.getLogger("RedisClientProvider");

    constructor(public defaultClientOptions: RedisClientOptions) {
        (this.logger);
    }
    async getRedisInfo(host: string, port: number, timeout = 5000): Promise<string> {
        let result: string = null;
        try {
            result = await utils.timeout(
                this
                    .createClient({ host: host, port: port })
                    .info(), timeout);

        }
        catch (err) {

        }
        return result;



    }
    createClient(options: RedisClientOptions = null): RedisClient {
        const result = new RedisClient(options || this.defaultClientOptions);
        RedisClientFactory.instances.push(result);
        return result;
    }


}