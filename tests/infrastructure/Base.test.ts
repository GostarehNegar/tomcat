import tomcat from "../../src";
//import '../../src/lib/extensions'
//import '../../src/lib/infrastructure/extensions';

// import '../../src/lib/infrastructure/hosting/extensions'
// tomcat.services.Provider.getConfig();
//tomcat.services.Provider.getMessageBus2();
import utils from "../../src/lib/common/Domain.Utils";


const Logger = tomcat.Infrastructure.Base.Logger
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
describe('Logger', () => {
    test('should create logger', () => {
        const logger = Logger.getLogger("test");
        const logger2 = tomcat.Infrastructure.Base.Logger.getLogger("test");
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
describe('clock', () => {
    test('clock works', async () => {
        //tomcat.Infrastructure.Base.register();


        await tomcat.services.getClock().synch();
        tomcat.services.getStop().onStop<{ candle: string }>(ctx => {
            ctx.data.candle;
            return false;
        });
        tomcat.services.getStop().queryStop('noone', 'info', { candle: 'hi' });
        const time = tomcat.services.getClock().timeNow();
        try {
            tomcat.utils.Throw('unexpected', 'unexpected error', { name: 'babak' });
        }
        catch (err) {
            (err)

        }
        expect(Math.abs((time.ticks - Date.now()) / 1000)).toBeLessThan(60 * 10);
    });

    describe('redisclientex', () => {

        test('redisclientprovider', async () => {
            const client = tomcat.services.getRedisFactory().createClient({});
            const f = utils.getClassName(client);
            (f);
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec((client).constructor.toString());
            const n1 = (results && results.length > 1) ? results[1] : "";
            const n = client.constructor.toString();
            console.log(n);
            console.log(n1);
            client.ping();
            await utils.delay(100);










        });
    });
    describe('store', () => {
        test('crud', async () => {
            type record = { firstName: string, id: string };
            const store = tomcat.services.getStoreFactory().createStore('redis');
            const repo_name = `contacts_${(Math.random() * 1000).toFixed()}`;

            var repo = store.getRepository<record>(repo_name);
            expect((await repo.toArray()).length).toBe(0);
            const babak: record = { firstName: 'babak', id: '1' };
            const paria: record = { firstName: 'paria', id: '2' };
            await repo.insert(babak);
            await repo.insert(paria);
            expect((await repo.get(babak.id)).firstName).toBe(babak.firstName);
            expect((await repo.get(paria.id)).firstName).toBe(paria.firstName);
            expect((await repo.toArray(undefined, undefined)).length).toBe(2);
            expect((await repo.toArray(undefined, 1)).length).toBe(1);
            expect((await repo.toArray(x => x.firstName === paria.firstName)).length).toBe(1);
            await repo.delete(babak.id);
            expect((await repo.toArray()).length).toBe(1);
            expect(await repo.get(babak.id)).toBeNull();





        });

    });
});