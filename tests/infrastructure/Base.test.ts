import tomcat from "../../src";
import utils from "../../src/common/Domain.Utils";
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
            const f = tomcat.utils.getClassName(client);
            (f);
            const funcNameRegex = /function (.{1,})\(/;
            const results = (funcNameRegex).exec((client).constructor.toString());
            const n1 = (results && results.length > 1) ? results[1] : "";
            const n = client.constructor.toString();
            console.log(n);
            console.log(n1);
            client.ping();
            await tomcat.utils.delay(100);










        });
    });
    describe('store', () => {
        test('crud', async () => {
            type record = { firstName: string, id: string };
            const store = tomcat.services.getStoreFactory().createStore({ provider: 'redis' });
            const repo_name = `contacts_${(Math.random() * 1000).toFixed()}`;
            const repo = store.getRepository<record>(repo_name);

            expect((await repo.toArray()).length).toBe(0);
            await utils.delay(10);
            const babak: record = { firstName: 'babak', id: '1' };
            const paria: record = { firstName: 'paria', id: '2' };
            await repo.insert(babak);
            await repo.insert(paria);
            expect(await repo.exists(babak.id)).toBeTruthy();
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

    describe('cache', () => {
        test('cache works', async () => {
            const data = { v: 'value' };
            const cache = tomcat.services.getCacheService();
            const expires = 15;
            const key = Math.random().toString();
            await cache.set(key, data, 10)
            expect(await cache.get(key)).not.toBeNull();
            await tomcat.utils.delay(expires * 1000);
            expect(await cache.get(key)).toBeNull();
        });

    });
    describe('datastream', () => {
        test('datastream', async () => {
            type dataType = { tick: number, index: number };
            const name = utils.randomName('data-stream', 2);
            const data: dataType[] = [];
            const start = Date.now();
            const count = 100;
            for (let i = 0; i < count; i++) {
                data.push({
                    tick: start + i,
                    index: i
                })
            }

            const stream = tomcat.services
                .getStoreFactory()
                .createStore({ provider: 'redis' })
                .getDataStream<dataType>(name);
            for (let i = 0; i < data.length; i++) {
                try {
                    await stream.add(data[i], data[i].tick)
                }
                catch (err) {
                    console.log(err);

                }
            }
            const all = await stream.toArray();
            expect(all.length).toBe(data.length);
            expect((await stream.toArray(x => x.index > 10, undefined, undefined, 2)).length).toBe(2)
            let stream_read_count = 0
            await stream.play((item, t) => {
                (item);
                (t);
                stream_read_count++;
                return stream_read_count >= data.length;
            }, 0);
            expect(stream_read_count).toBe(data.length);
            // const stream1 = tomcat.services
            //     .getStoreFactory()
            //     .createStore('redis')
            //     .getDataStream<dataType>(name);
            setTimeout(async () => {
                data.push({ index: -1, tick: 100 })
                await stream.add(data[data.length - 1]);
            }, 200);
            stream_read_count = 0;
            await stream.play(() => {
                stream_read_count++;
                return true;
            });
            expect(stream_read_count).toBe(1);
            const info = await stream.getInfo();
            expect(info.length).toBe(data.length);
            const first = await stream.getAt(data[0].tick);
            (first)
            stream_read_count = 0;
            let reverse_first: dataType = null;
            for await (const item of stream.reverse()) {
                (item);
                reverse_first = item;

            }
            expect(reverse_first.index).toBe(data[0].index);
            const first_item = await stream.getFirst();
            const last_item = await stream.getLast();
            expect(first_item.index).toBe(data[0].index);
            expect(last_item.index).toBe(data[data.length - 1].index);
        });

    });

});