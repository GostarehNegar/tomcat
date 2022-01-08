import tomcat from "../src";


jest.setTimeout(20000);

describe("redis service ", () => {

    test('redis service works', async () => {

        // const target = new tomcat.Domain.Services.RedisProcessAdapter({ port: 0 });
        // target.start();
        // tomcat.services.getDomainServices();
        tomcat.getHostBuilder('test').build();
        tomcat.services().getRedisFactory().getRedisInfo("redis", 6379);
        const client = tomcat.services().getRedisFactory().createClient({
            host: "redis",
            port: 6379
        });
        const indo = await client.info();
        (indo)

    });
});