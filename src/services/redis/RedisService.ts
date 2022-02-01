import utils from "../../common/Domain.Utils";
import { redisServiceDefinition } from "../../contracts";
import { Contracts } from "../../domain";
import { ILogger, IServiceProvider } from "../../infrastructure/base";
import { IHostBuilder, IHostedService } from "../../infrastructure/hosting";
import { RedisMeshService } from "./RedisMeshService";

export function AddRedisService(host: IHostBuilder): IHostBuilder {
    host.addMeshService_deprecated({ category: 'redis', parameters: { schema: '' } }, (def) => {
        return RedisMeshService.GetOrCreate(def as redisServiceDefinition);
    });
    host.addHostedService(sp => new RedisService(sp));
    return host;
}


export class RedisService implements IHostedService {
    logger: ILogger = utils.getLogger("RedisService");
    constructor(private serviceProvider: IServiceProvider) {

    }
    async start(): Promise<void> {
        const bus = this.serviceProvider.getBus();

        bus.subscribe(Contracts.queryRedisOptions(null).topic, async (ctx) => {
            try {
                const res = await RedisMeshService.handle(ctx);
                await ctx.reply(res);
            }
            catch (err) {
                await ctx.reject(err);
            }
        })
        this.logger.info(
            `redis-service successfully started.`);

    }
    async stop(): Promise<void> {
        await Promise.resolve();
    }


}