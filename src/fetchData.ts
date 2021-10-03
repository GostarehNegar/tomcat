// import { exit } from "process";
import { utils } from "./lib/base";

import tomcat from "."



const Pipeline = tomcat.Index.Domain.Strategy.Pipeline
const Indicators = tomcat.Index.Domain.Indicators;

(async () => {
    await utils.getProxy(undefined, 3, undefined, 5000);
    const pipeline = new Pipeline()
    pipeline.from('binance', 'spot', 'BTCUSDT', '1m')
        .add(Indicators.ATR())
        .add(Indicators.ADX())
        .add(Indicators.MDI())
        .add(Indicators.PDI())
        // .add(Indicators.SAR())
        .add(Indicators.SAR(), { stream: true, name: "FILTER-8000" })


    pipeline.start(tomcat.utils.toTimeEx(Date.UTC(2020, 0, 1, 0, 0, 0, 0)))
    // while (true) {
    //     await tomcat.utils.delay(50 * 1000)
    // }
})()