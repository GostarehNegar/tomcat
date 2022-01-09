import tomcat from "../../src";
import { Logger } from "../../src/infrastructure/base";

//import '../../src/lib/extensions'
//import '../../src/lib/infrastructure/extensions';

// import '../../src/lib/infrastructure/hosting/extensions'
// tomcat.services.Provider.getConfig();
//tomcat.services.Provider.getMessageBus2();


// const Logger = tomcat.Infrastructure.Base.Logger
const TimeEx = tomcat.Infrastructure.Base.TimeEx


jest.setTimeout(80000)
describe('ServiceLocator', () => {

    test('registeration', () => {
        const provider = new tomcat.Infrastructure.Base.ServiceProvider() as tomcat.Infrastructure.Base.IServiceProvider;
        provider.register("sample-service", "sample-value-1");
        provider.register("sample-service", "sample-value");
        provider.register("sample-service1", () => "sample-value1");
        provider.register("sample-service", "some-other-value", true);
        expect(provider.getService("sample-service") == "sample-value");
        expect(provider.getService("sample-service1") == "sample-value1");
        expect(2).toBe(provider.getServices("sample-service").length);
        expect("sample-value").toBe(provider.getService("sample-service"));

    });

});
describe("NodeManager", () => {
    test("first", async () => {
        const host = tomcat.getHostBuilder("NodeManager").build()
        const node = host.services.getNodeManagerService()
        node.startNode({ name: "paria", jsFileName: "dataService.js", cwd: "../tomcat-bot-hosting/build/main/services/" })
        await tomcat.utils.delay(10000)
    })
    test("script", async () => {
        const host = tomcat.getHostBuilder("NodeManager").build()
        const node = host.services.getNodeManagerService()
        const res = await node.startNodeByName("dataScript");
        (res)
        await tomcat.utils.delay(10000)
    })
})
describe('Logger', () => {
    test('should create logger', () => {
        // const logger = Logger.getLogger("test");
        Logger.level = 'debug'
        const logger2 = tomcat.Infrastructure.Base.Logger.getLogger("test")
        // logger2.level = 'debug'
        // (logger);
        logger2.debug("hi")
    });
});
describe('TimeEx', () => {

    test('should construct TimeEx with date or ticks', async () => {
        const time = new TimeEx(new Date());
        const time2 = new TimeEx(Date.now());
        const time3 = new TimeEx(time2);
        const time4 = new TimeEx(time3.asDate.toISOString())
        const time5 = new TimeEx(time4.ticks.toString())
        expect(time.ticks).toBeGreaterThan(0);
        expect(time2.ticks).toBeGreaterThanOrEqual(time.ticks);
        expect(time3.ticks).toBe(time2.ticks)
        expect(time4.ticks).toBe(time3.ticks)
        expect(time5.ticks).toBe(time4.ticks)

    });

});

describe('utils', () => {

    test('wild card match works', async () => {
        expect(tomcat.utils.wildCardMatch('babak', 'b*'))
        expect(tomcat.utils.wildCardMatch('babak', 'b?bak'))
        expect(tomcat.utils.wildCardMatch('babak', 'a*')).toBeFalsy();

    });

});
