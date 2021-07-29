import tomcat from '../src';
import { CandleStick } from '../src/lib/domain/data/stores/Models';
import utils from '../src/lib/domain/data/stores/Utils'
import fs from 'fs';
import { CandleStickArrayModel } from '../src/lib/domain/base/Models';
const Database = tomcat.Internals.Implementaions.Data.CandleStickLiteDb;
(CandleStick);
(fs)






// var roundToNearestMinute = function (date) {
//     var coeff = 1000 * 60 * 1; // <-- Replace {5} with interval

//     return new Date(Math.round(date.getTime() / coeff) * coeff);
// };
describe('LiteDb', () => {
    test('should create db based on exhange name.', async () => {
        const i = Number.parseInt("30m")
        console.log(i)
        var db = new Database('binance', 'btcusd');
        await db.run(async () => {
            await db.ensureTable();
        });
        expect(db.fileName.indexOf('binance')).toBeGreaterThan(-1);
        expect(fs.existsSync(db.fileName));
    })

    test('should push data', async () => {
        var db = new Database('binance', 'btcusd');
        var d = new Date(1627454220000);
        console.log(d);
        const candle = new CandleStick({
            openTime: 1000,
            open: 256,
            close: 6555,
            high: 555,
            low: 555,
            closeTime: 5
        });
        const m = new CandleStickArrayModel(candle);
        //m.setCandle(candle.getCandle());
        const tt = JSON.stringify(m);
        (tt)

        const items: CandleStick[] = []
        const start = utils.toTimeEx();
        console.log(start)
        for (var i = 0; i < 50000; i++) {
            items.push(new CandleStick({
                openTime: start.ticks + i * 1000,
                open: 256,
                close: 6555,
                high: 555,
                low: 555,
                closeTime: 5
            }));
        }
        var exists = false;
        await db.run(async () => {
            await db.clear();
            await db.push(items, true);
            exists = await db.exists(items[0].data.openTime);
        });
        expect(exists);

    });

});