
import { Contracts } from '../domain';
import { baseUtils } from '../infrastructure/base';
// import { BaseConstants } from '../infrastructure/base/baseconstants';
import { HostBuilder } from '../infrastructure/hosting';

import "../extensions"
import { RedisMeshService } from './redis/RedisMeshService';
import { redisServiceDefinition } from '../contracts';
// tomcat.Infrastructure.Base.Logger.level = 'debug'




(async () => {
    const client1 = new HostBuilder('redisservice')
        .addMessageBus(cfg => {
            cfg.endpoint = "redisservice";
            cfg.transports.websocket.url = "http://localhost:8084/hub";
        })
        .addMeshService({ category: 'redis', parameters: {} }, (def) => RedisMeshService.GetOrCreate(def as redisServiceDefinition))
        .build();
    client1.bus.subscribe(Contracts.queryRedisOptions(null).topic, async (ctx) => {

        try {
            const res = await RedisMeshService.handle(ctx);
            await ctx.reply(res);
        }
        catch (err) {
            await ctx.reject(err);

        }
    })

    await client1.start()
    await baseUtils.delay(15000);
})()