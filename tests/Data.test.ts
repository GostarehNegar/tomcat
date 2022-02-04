import tomcat from "../src";
import { CandleStickData } from "../src/common";
import utils from "../src/common/Domain.Utils";
import { DataServiceDefinition, getStreamName } from "../src/contracts";
import TestFixture from './TestFixture'

(tomcat)
jest.setTimeout(60 * 1000);
describe('Data Tests', () => {
    test('01 ', async () => {
        tomcat.config.infrastructure.data.redisOptions = { host: 'localhost' };
        tomcat.config.infrastructure.internet.proxy.url = "http://localhost:2395";
        const fixture = await TestFixture.setup();
        const client = fixture.getBuilder('test')
            .addMeshService(s => s.userServiceConstructor({ category: 'data', parameters: {} }, {},
                def => new tomcat.Domain.Data.CandleStreamMeshService(def as DataServiceDefinition)))
            .build();
        const stream_name1 = getStreamName('binance', 'BTC/USDT', 'future', '1m')
        const stream1 = client.services.getStoreFactory()
            .createStore({ 'provider': 'redis' })
            .getDataStream<CandleStickData>(stream_name1);
        stream1.play((x) => {
            (x);
            return false;

        });
        const lll = await stream1.getLast();

        (lll);

        await client.start();
        const def = new DataServiceDefinition({ interval: '1m', exchange: 'binance', market: 'future', 'symbol': 'BTC/USDT' });
        await client.node.startService(def)
        await tomcat.utils.delay(10000);
        const stream_name = getStreamName('binance', 'BTC/USDT', 'future', '1m')
        const stream = client.services.getStoreFactory()
            .createStore({ 'provider': 'redis' })
            .getDataStream<CandleStickData>(stream_name);
        var data = await stream.toArray();
        (data);
        const c = await stream.getFirst();
        let d = utils.toTimeEx(c.openTime).asUTCDate;
        const l = await stream.getLast();
        const i = await stream.getInfo();
        d = utils.toTimeEx(l.openTime).asUTCDate;
        (l);
        (i);
        (c);
        (d);










    })
})