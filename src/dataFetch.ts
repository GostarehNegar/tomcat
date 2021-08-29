
import { TimeEx } from "./lib";
import { DataProvider } from "./lib/domain/data/sources/DataProvider";

(async () => {
    const dataProvider = new DataProvider('binance', 'spot', 'BTCUSDT', '1m')
    for (let i = 0; i <= 11; i++) {

        const endTime = new TimeEx(Date.UTC(2020, i + 1, 0, 0, 0, 0, 0));
        const startTime = new TimeEx(Date.UTC(2020, i, 1, 0, 0, 0, 0));
        // const strategyContext: IStrategyContext = { startTime: startTime.ticks, endTime: endTime.ticks }

        console.log(`fetched month${i} to ${i + 1}`);

        await dataProvider.getData(startTime, endTime);
    }
    console.log("DONE!");

})();