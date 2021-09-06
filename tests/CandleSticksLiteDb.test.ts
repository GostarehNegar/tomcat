import fs from 'fs';

import tomcat from '../src';

const Database = tomcat.Index.Domain.Data.CandleStickLiteDb;
const CandleStick = tomcat.Index.Domain.Data.CandleStick;

(fs)
// var roundToNearestMinute = function (date) {
//     var coeff = 1000 * 60 * 1; // <-- Replace {5} with interval

//     return new Date(Math.round(date.getTime() / coeff) * coeff);
// };
describe('LiteDb', () => {
    test('should create db based on exhange name.', async () => {
        const i = Number.parseInt("30m")
        console.log(i)
        const db = new Database('binance', 'futures', 'btcusd', '1m');
        await db.run(async () => {
            await db.ensureTable();
        });
        expect(db.fileName.indexOf('binance')).toBeGreaterThan(-1);
        expect(fs.existsSync(db.fileName));
    })

    test('should push data', async () => {
        const db = new Database('binance', 'futures', 'btcusd', '1m');



        const items: tomcat.Index.Domain.Data.CandleStick[] = []
        const start = tomcat.utils.toTimeEx();
        console.log(start)
        for (let i = 0; i < 50000; i++) {
            items.push(new CandleStick({
                openTime: start.ticks + i * 1000,
                open: 256,
                close: 6555,
                high: 555,
                low: 555,
                closeTime: 5
            }));
        }

        let exists = false;
        await db.run(async () => {
            await db.clear();
            await db.push(items, true);
            exists = await db.exists(items[0].data.openTime);
            await db.select(start.ticks, 6)
        });
        expect(exists);

    });
    test('select data', async () => {
        const db = new Database('binance', 'future', 'btcusd', '1m');

        const items: tomcat.Index.Domain.Data.CandleStick[] = []
        for (let i = 0; i <= 5; i++) {
            items.push(new CandleStick({
                openTime: i,
                open: 256,
                close: 6555,
                high: 555,
                low: 555,
                closeTime: 5
            }));
        }

        await db.run(async () => {
            await db.clear();
            await db.push(items, true);
            // const dataSource = new DataSourceFactory()

            // exists = await db.exists(items[0].data.openTime);
            const res = await db.select(0, 1)
            expect(res.length).toBe(1)
            expect((await db.getLatestCandle()).openTime).toBe(5)
            expect((await db.getExactCandle(0))).not.toBeNull()
            expect((await db.getExactCandle(0)).openTime).toBe(0)
            expect((await db.getExactCandle(6))).toBeNull()

        });

    });

});