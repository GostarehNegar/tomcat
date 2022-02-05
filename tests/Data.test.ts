import tomcat from "../src";
import { CandleStickCollection, CandleStickData } from "../src/common";
import utils from "../src/common/Domain.Utils";
import { DataServiceDefinition, getStreamName, queryDataStreamNameReply } from "../src/contracts";

import TestFixture from './TestFixture'
(utils);

(tomcat)
jest.setTimeout(60 * 10000);
describe('Data Tests', () => {
    test('01-ready DataServices should read data and store in stream. ', async () => {
        tomcat.config.infrastructure.data.redisOptions = { host: 'localhost' };
        tomcat.config.infrastructure.internet.proxy.url = "http://172.16.6.56:8080";
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
        const info1 = await stream.getInfo();
        await tomcat.utils.delay(10000);
        const info2 = await stream.getInfo();
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
        const client1 = fixture.getBuilder('test')
            .build();
        (client1);
        await client.start()
        const collection = new CandleStickCollection([]);
        let done = false;
        await client.bus.subscribe(channelName, async ctx => {
            (ctx);
            if (ctx.message.from === client.bus.endpoint)
                await utils.delay(1);
            console.log(collection.length);
            collection.add(CandleStickData.from(ctx.message.cast<CandleStickData>()));
            //const candle = ctx.message.cast<CandleStickData>();
            if (collection.length < 1000)
                await ctx.reply('ok');
            else {
                done = true;
                await ctx.reject("done");
            }
        });
        const reply = await client.bus.createMessage(tomcat.Domain.Contracts.requestDataStreamPlay({
            exchange: 'binance',
            'interval': '1m',
            'market': 'future',
            symbol: 'BTC/USDT',
            channel: channelName,
            start: start.ticks

        })).execute();

        (reply);
        while (!done) {

            await utils.delay(1000);
        }

        const missed = collection.getMissingCandles(collection.firstCandle.openTime, collection.lastCandle.openTime);
        (missed)


    })
    test("04", async () => {
        tomcat.config.infrastructure.data.redisOptions = { host: 'localhost' };
        tomcat.config.infrastructure.internet.proxy.url = "http://172.16.6.56:8080";
        const fixture = await TestFixture.setup();
        const client = fixture.getBuilder('test')
            .addMeshService(s => s.userServiceConstructor({ category: 'data', parameters: {} }, {},
                def => new tomcat.Domain.Data.CandleStreamMeshService(def as DataServiceDefinition)))
            .build();
        await client.start();
        await tomcat.utils.delay(10000);
        const stream_name = getStreamName('coinex', 'BTC/USDT', 'future', '1m')
        const stream = client.services.getStoreFactory()
            .createStore({ 'provider': 'redis' })
            .getDataStream<CandleStickData>(stream_name);
        for (let i = 1; i < 1000002; i++) {
            // await tomcat.utils.delay(10)
            await stream.add(new CandleStickData(i, i, i, i, i, i, i))
        }

    })

})