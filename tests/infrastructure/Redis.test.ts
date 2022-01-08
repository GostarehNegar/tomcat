import tomcat from "../../src"
import { RedisClientOptions } from "../../src/infrastructure/services/";

jest.setTimeout(80000)

describe('redis', () => {

    test('redis utils works', async () => {
        const host = tomcat.getHostBuilder('test').build();
        (host);
        tomcat.Infrastructure.Services.RedisUtils.IsRedisServerInstalled();


    });
    test('getRedisInfo works', async () => {
        const host = tomcat.getHostBuilder('test').build();
        const info = await host.services.getRedisFactory()
            .getRedisInfo("localhost", 6379);
        expect(info).toBeNull();
    })

    test('how redis client factory works', async () => {


        const options: RedisClientOptions = {
            host: "localhost",
            keyPrefix: "myperfix-",
            db: 12
        }
        const host = tomcat.getHostBuilder("test").build();
        host.config.data.redisEx.host = options.host;
        host.services.getRedisFactory().defaultClientOptions = options;
        const client = host.services.getRedisFactory().createClient(null);
        expect(client.options.host).toBe(options.host);
        const key = tomcat.utils.randomName("key")
        await client.set(key, "babak");
        expect((await client.get(key))).toBe("babak");
    });
    test("redisAdapter", async () => {
        const host = tomcat.getHostBuilder("test").build()
        const adapter = new tomcat.Domain.Services.RedisProcessAdapter({ port: 6350 })
        const containerInfo = await adapter.start()
        const info = await host.services.getRedisFactory().getRedisInfo("localhost", containerInfo.port)
        expect(containerInfo).not.toBeUndefined()
        expect(info).not.toBe(null)
    })

    test("redisMeshService works", async () => {
        const host = tomcat.getHostBuilder("test").build()

        const target = tomcat.Domain.Services.RedisMeshService
            .GetOrCreate({ category: 'redis', parameters: {} });
        await target.start(null);
        (host);
        (target);



    })
    test("redisUtils", async () => {
        await tomcat.Infrastructure.Services.RedisUtils.InstallRedis()
        const a = await tomcat.Infrastructure.Services.RedisUtils.IsRedisServerInstalled()
        console.log(a);
    })
});