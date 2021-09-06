import tomcat from "../src";

const provider = new tomcat.Index.Base.ServiceProvider() as tomcat.Index.Base.IServiceProvider;
const Logger = tomcat.Index.Base.Logger
const TimeEx = tomcat.Index.Base.TimeEx
const utils = tomcat.utils

describe('ServiceLocator', () => {

    test('registeration', () => {
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
describe('Logger', () => {
    test('should create logger', () => {
        const logger = Logger.getLogger("test");
        const logger2 = tomcat.Index.Base.Logger.getLogger("test");
        (logger);
        (logger2);
        logger.log("hi", logger2)



    });
});
describe('TimeEx', () => {

    test('should construct TimeEx with date or ticks', async () => {

        const time = new TimeEx(new Date());
        const time2 = new TimeEx(Date.now());
        const time3 = new TimeEx(time2);
        expect(time.ticks).toBeGreaterThan(0);
        expect(time2.ticks).toBeGreaterThanOrEqual(time.ticks);
        expect(time3.ticks).toBe(time2.ticks)


    });

});

describe('utils', () => {

    test('wild card match works', async () => {
        expect(utils.wildCardMatch('babak', 'b*'))
        expect(utils.wildCardMatch('babak', 'b?bak'))
        expect(utils.wildCardMatch('babak', 'a*')).toBeFalsy();

    });

});