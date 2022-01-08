
import { Contracts } from '../domain';
import { baseUtils } from '../infrastructure/base';
// import { BaseConstants } from '../infrastructure/base/baseconstants';
import { HostBuilder } from '../infrastructure/hosting';

import "../extensions"
import { RedisMeshService } from './redis/RedisMeshService';
// tomcat.Infrastructure.Base.Logger.level = 'debug'




(async () => {
    const client1 = new HostBuilder('redisservice', null)
        .addMessageBus(cfg => {
            cfg.endpoint = "redisservice";
            cfg.transports.websocket.url = "http://localhost:8084/hub";
        })
        .addMeshService({ category: 'redis', parameters: {} }, (def) => RedisMeshService.GetOrCreate(def))
        .build();
    client1.bus.subscribe(Contracts.queryRedisOptions(null).topic, async (ctx) => {

        RedisMeshService.handle(ctx);



        // const meshNode = client1.services.getService<MeshNode>(BaseConstants.ServiceNames.MeshNode)
        // const payload = ctx.message.cast<Contracts.queryRedisContainerPayload>()
        await ctx.reply({ host: "localhost", port: 6379, db: "2" })
        // const service = (meshNode.runningServices as RedisService[]).find(x => x.containerName == payload.containerName)
        // if (service && service.isReady) {
        //     meshNode.logger.info(`container ${service.containerName} was found`)
        //     await ctx.reply({ connectionString: `redis://localhost:${service.portNumber}` })
        // } else {
        //     meshNode.logger.warn(`no container by the name of ${payload.containerName} was found or service is not ready . ready :${service?.isReady}`)
        //     await ctx.reply(null)
        // }
    })

    await client1.start()
    await baseUtils.delay(15000);
})()