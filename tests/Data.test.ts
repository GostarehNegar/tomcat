import tomcat from "../src";
import { CandleStickData } from "../src/common";
import utils from "../src/common/Domain.Utils";
import { DataServiceDefinition, getStreamName, queryDataStreamNameReply } from "../src/contracts";
import TestFixture from './TestFixture'
(utils);

(tomcat)
jest.setTimeout(60 * 1000);
describe('Data Tests', () => {
    test('01-ready DataServices should read data and store in stream. ', async () => {
        tomcat.config.infrastructure.data.redisOptions = { host: 'localhost' };
        tomcat.config.infrastructure.internet.proxy.url = "http://localhost:2395";
        const fixture = await TestFixture.setup();
        const client = fixture.getBuilder('test')
            .addMeshService(s => s.userServiceConstructor({ category: 'data', parameters: {} }, {},
                def => new tomcat.Domain.Data.CandleStreamMeshService(def as DataServiceDefinition)))
            .build();
        await client.start();
        const def = new DataServiceDefinition(
            { interval: '1m', exchange: 'binance', market: 'future', 'symbol': 'BTC/USDT' });
        await client.node.startService(def)
        await tomcat.utils.delay(10000);
        const stream_name = getStreamName('binance', 'BTC/USDT', 'future', '1m')
        const stream = client.services.getStoreFactory()
            .createStore({ 'provider': 'redis' })
            .getDataStream<CandleStickData>(stream_name);
        var info1 = await stream.getInfo();
        await tomcat.utils.delay(10000);
        var info2 = await stream.getInfo();
        expect(info2.length).toBeGreaterThan(info1.length);

    })
    test('02- DataServices answers to get stream info.', async () => {
        tomcat.config.infrastructure.data.redisOptions = { host: 'localhost' };
        tomcat.config.infrastructure.internet.proxy.url = "http://localhost:2395";
        const fixture = await TestFixture.setup();
        const client = fixture.getBuilder('test')
            .addMeshService(s => s.userServiceConstructor({ category: 'data', parameters: {} }, {},
                def => new tomcat.Domain.Data.CandleStreamMeshService(def as DataServiceDefinition)))
            .build();
        await client.start();
        const def = new DataServiceDefinition(
            { interval: '1m', exchange: 'binance', market: 'future', 'symbol': 'BTC/USDT' });
        await client.node.startService(def)
        await utils.delay(1000);

        const reply = await client.bus.createMessage(tomcat.Domain.Contracts.queryDataStreamName({
            exchange: 'binance',
            'interval': '1m',
            'market': 'future',
            symbol: 'BTC/USDT'
        })).execute();
        (reply);
        await utils.delay(3000);
        // we can use this reply to
        // read redis
        const streamName = reply.cast<queryDataStreamNameReply>().streamName;
        const redis = reply.cast<queryDataStreamNameReply>().redis;
        (redis);
        const stream = client.services.getStoreFactory()
            .createStore({ 'provider': 'redis' })//, 'redis': { 'host': redis } })
            .getDataStream<CandleStickData>(streamName);
        /// if we wait long enough
        /// we will get recen candles
        let lastCandle: CandleStickData = null;
        const start = utils.toTimeEx(new Date(2021, 0, 5));
        await stream.play(async (c) => {
            lastCandle = c;
            //console.log(c.openDate());
            console.log(CandleStickData.from(c).openDate());
            return false;
        }, start);

        expect(lastCandle).not.toBeNull();
        expect(utils.toTimeEx(lastCandle.openTime).asDate.getDate()).toBe(new Date().getDate());
    })

    test('03- DataServices can play data stream.', async () => {
        tomcat.config.infrastructure.data.redisOptions = { host: 'localhost' };
        tomcat.config.infrastructure.internet.proxy.url = "http://localhost:2395";
        const fixture = await TestFixture.setup();
        const client = fixture.getBuilder('test')
            .addMeshService(s => s.userServiceConstructor({ category: 'data', parameters: {} }, {},
                def => new tomcat.Domain.Data.CandleStreamMeshService(def as DataServiceDefinition)))
            .build();
        await client.start();
        const def = new DataServiceDefinition(
            { interval: '1m', exchange: 'binance', market: 'future', 'symbol': 'BTC/USDT' });
        await client.node.startService(def)
        await utils.delay(1000);

        const channelName = utils.randomName('data-channel')
        const start = utils.toTimeEx(new Date(2021, 0, 5));
        let count = 0;
        const client1 = fixture.getBuilder('test')
            .build();
        await client1.start()

        await client1.bus.subscribe(channelName, async ctx => {
            (ctx);
            count++;
            //await utils.delay(1);
            if (count < 1000)
                await ctx.reply('ok');
            else {
                ctx.reject("done");
            }
            const b = start;
            (b);



        });

        const reply = await client1.bus.createMessage(tomcat.Domain.Contracts.requestDataStreamPlay({
            exchange: 'binance',
            'interval': '1m',
            'market': 'future',
            symbol: 'BTC/USDT',
            channel: channelName,
            start: start.ticks

        })).execute();
        (reply);

        await utils.delay(60 * 10000);
    })

})