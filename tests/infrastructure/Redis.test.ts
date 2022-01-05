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
            host: "redis",
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
    })
});