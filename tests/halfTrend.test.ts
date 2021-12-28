import tomcat from '../src'
import { CandleStickCollection, CandleStickData } from '../src/common'
// import utils from '../src/lib/common/Domain.Utils'
import { Stream } from '../src/streams'

const HalfTrend = tomcat.Domain.Indicators.HalfTrend
const HTSignal = tomcat.Domain.Indicators.HTSignal
// const HTTrend = tomcat.Domain.Indicators.HTTrend
const RSI = tomcat.Domain.Indicators.RSI

const Pipeline = tomcat.Domain.Pipes.Pipeline
const isGreen = (candle: CandleStickData) => {
    return candle.close > candle.open
}
const countGreenCandle = (candles: CandleStickCollection, t1, t2) => {
    const t1Index = candles.items.findIndex(x => x.openTime >= t1)
    const t2Index = candles.items.findIndex(x => x.openTime == t2)
    let res = 0
    if (t1Index < 0 || t2Index < 0) {
        return res
    }
    for (let i = t1Index; i <= t2Index; i++) {
        if (isGreen(candles.items[i])) {
            res++
        }
    }
    return res

}
// const countSignals = (candles: CandleStickCollection, signal: string, indicatorId: string) => {
//     let res = 0
//     for (let i = 0; i < candles.length; i++) {
//         if (candles.items[i].indicators.getValue<string>(indicatorId) == signal) {
//             res++
//         }
//     }
//     return res
// }
class Mohsen {
    signal: string
    candle: CandleStickData
}

jest.setTimeout(60000000)
describe('halfTrens', () => {

    // test("first", async () => {
    //     const pipeline = new Pipeline()
    //     const candles = []
    //     pipeline.from('binance', 'spot', 'BTCUSDT', '1m', "test7")
    //         // .add(Indicators.SAR())
    //         .add(HalfTrend(2, 2, 500, '15m'), { stream: true, name: "indicatorsTest5" })
    //         .add(async (candle) => {
    //             // THIS.getScaler('15m').candles
    //             candles.push(candle)
    //             if (candle.closeTime >= tomcat.utils.toTimeEx(Date.UTC(2021, 10, 21, 6, 40, 59, 59)).ticks) {
    //                 console.log(candle);
    //             }
    //             await Promise.resolve()
    //         })

    //     pipeline.start(tomcat.utils.toTimeEx().addMinutes(-200 * 60))
    //     await tomcat.utils.delay(3000 * 1000)
    // })
    // test("RSI", async () => {
    //     const pipeline = new Pipeline()
    //     const candles = []
    //     let targetCandle: CandleStickData;
    //     pipeline.from('binance', 'spot', 'BTCUSDT', '1m', "test11")
    //         // .add(Indicators.SAR())
    //         .add(RSI(14, 200, '1m'), { stream: true, name: "indicatorsTest9" })
    //         .add(async (candle) => {
    //             // THIS.getScaler('15m').candles
    //             candles.push(candle)
    //             if (candle.openTime == 1637476800000) {
    //                 targetCandle = candle
    //             }
    //             await Promise.resolve()
    //         })

    //     pipeline.start(tomcat.utils.toTimeEx().addMinutes(-4 * 60))
    //     await tomcat.utils.delay(30 * 1000)
    //     expect(targetCandle.indicators.getNumberValue(RSI(14, 200, "1m"))).toBeCloseTo(42.66, 2)
    // })
    // test("Mohsen", async () => {
    //     const pipeline = new Pipeline()
    //     // const candles = []
    //     // let trend = NaN
    //     const halfTrend = HalfTrend(2, 2, 200, '15m')
    //     const hTSignal = HTSignal(2, 2, 200, '15m')
    //     // const hTTrend = HTTrend(2, 2, 200, '15m')
    //     const rsi = RSI(2, 200, '15m')
    //     // const waitFor = tomcat.utils.toTimeEx(1 * 15 * 60 * 1000)
    //     let signal = ""
    //     // let estimatedPositionTime;
    //     // let trendChangeCandle: CandleStickData;
    //     let position = "sell"
    //     let signalCandle: CandleStickData
    //     const getSignal = (candle: CandleStickData) => {
    //         return candle.indicators.getValue<string>(hTSignal)
    //     }
    //     pipeline.from('binance', 'spot', 'SHIBUSDT', '1m', "test1")
    //         .add(rsi)
    //         .add(halfTrend, { stream: true, name: "indicatorsTest3" })
    //         .add(async (candle, THIS) => {
    //             if (getSignal(candle) == "sell") {
    //                 console.log();
    //             }
    //             THIS.context.stream = THIS.context.stream || new Stream<Mohsen>("Mohsen1")
    //             const stream = THIS.context.stream as Stream<Mohsen>
    //             const candles = THIS.getScaler("15m", 100).push(candle, (oneMinuteCandles, last) => {
    //                 const sellSignals = countSignals(oneMinuteCandles, "sell", hTSignal.id)
    //                 const buySignals = countSignals(oneMinuteCandles, "buy", hTSignal.id)
    //                 if (sellSignals > 0) {
    //                     last.indicators.setValue(hTSignal, "sell")
    //                 }
    //                 if (buySignals > 0) {
    //                     last.indicators.setValue(hTSignal, "buy")
    //                 }

    //             })
    //             // if (candle.closeTime == 1633923899999) {
    //             //     console.log("");
    //             // }
    //             if (candle.indicators.getValue<string>(hTSignal)) {
    //                 signal = candle.indicators.getValue<string>(hTSignal)
    //                 signalCandle = candle
    //             }
    //             const t = utils.toTimeEx(candle.openTime).subtract(signalCandle.openTime).absMinutes;
    //             (t)
    //             if (signalCandle.indicators.getValue<string>(hTSignal) != candle.indicators.getValue<string>(hTSignal)) {
    //                 console.log("position Switch");
    //             }

    //             if (signalCandle && candle.indicators.getNumberValue(rsi)) {
    //                 if (candle.indicators.getNumberValue(rsi) <= 10 && signal == 'buy' && position != "buy") {
    //                     // candle.indicators.setValue()
    //                     console.log("BUY");
    //                     position = "buy"
    //                     await stream.write(tomcat.utils.toTimeEx(candle.openTime), { signal: "buy", candle: candle })
    //                 }
    //             }
    //             const _candle = candles.items[candles.length - 2]
    //             if (signal == 'sell' && position != "sell") {
    //                 const count = countGreenCandle(candles, signalCandle.openTime, _candle.openTime)
    //                 // if (candle.close - candle.open > 0) {
    //                 //     greenCandleCount += 1
    //                 // }
    //                 if (count == 2) {
    //                     console.log("sell")
    //                     position = "sell"
    //                     await stream.write(tomcat.utils.toTimeEx(candle.openTime), { signal: "sell", candle: candle })
    //                 }
    //             }
    //         })
    // .add(async (candle) => {
    //     candles.push(candle)
    //     if (candle.indicators && candle.indicators.has(hTTrend)) {
    //         if (candle.indicators.has(hTTrend)) {
    //             if (!trendChangeCandle) {
    //                 trendChangeCandle = candle
    //             } else {
    //                 if (trendChangeCandle.indicators.getNumberValue(hTTrend) != candle.indicators.getNumberValue(hTTrend)) {
    //                     trendChangeCandle = candle
    //                 } else {
    //                     if (((candle.openTime - trendChangeCandle.openTime) / (1000 * 60)) > 10) {
    //                         candle.indicators.setValue("Mohsen", 1)
    //                     }
    //                 }
    //             }
    //         }
    //         // if (trend != candle.indicators.getNumberValue(hTTrend)) {
    //         //     trendChangeCandle = candle
    //         //     estimatedPositionTime = candle.openTime + waitFor.ticks
    //         // }
    //         // if (candle.openTime == estimatedPositionTime && candle.indicators && candle.indicators.has(hTTrend, rsi, hTSignal)) {
    //         //     if (candle.indicators.getNumberValue(hTTrend) == trend && candle.indicators.getNumberValue(rsi) >= 90) {
    //         //         console.log("buy or sell");
    //         //     }
    //         //     if (candle.indicators.getNumberValue(hTTrend) == trend && candle.indicators.getNumberValue(rsi) <= 10) {
    //         //         console.log("buy or sell");
    //         //     }
    //         // }
    //         // trend = candle.indicators.getNumberValue(hTTrend)
    //     }
    // })


    //     pipeline.start(tomcat.utils.toTimeEx(Date.UTC(2021, 9, 1, 0, 0, 0, 0)))
    //     await tomcat.utils.delay(300 * 1000)
    // })
    test("MohsenV2", async () => {
        const pipeline = new Pipeline()
        const halfTrend = HalfTrend(2, 2, 200, '30m')
        const hTSignal = HTSignal(2, 2, 200, '30m')
        const rsi = RSI(2, 200, '30m')
        let signal = ""
        let position = "sell"
        let signalCandle: CandleStickData
        // const getSignal = (candle: CandleStickData) => {
        //     return candle.indicators.getValue<string>(hTSignal)
        // }
        pipeline.from('binance', 'spot', 'SHIBUSDT', '30m', "test1")
            .add(rsi)
            .add(halfTrend, { stream: true, name: "indicatorsTest3" })
            .add(async (candle, THIS) => {
                THIS.context.stream = THIS.context.stream || new Stream<Mohsen>("Mohsen1")
                const stream = THIS.context.stream as Stream<Mohsen>
                const candles = THIS.getScaler("30m", 100).push(candle)

                if (candle.indicators.getValue<string>(hTSignal)) {
                    signal = candle.indicators.getValue<string>(hTSignal)
                    signalCandle = candle
                }
                if (signalCandle && candle.indicators.getNumberValue(rsi)) {
                    if (candle.indicators.getNumberValue(rsi) <= 10 && signal == 'buy' && position != "buy") {
                        // candle.indicators.setValue()
                        console.log("BUY");
                        position = "buy"
                        await stream.write(tomcat.utils.toTimeEx(candle.openTime), { signal: "buy", candle: candle })
                    }
                }
                // const _candle = candles.items[candles.length - 2]
                if (signal == 'sell' && position != "sell") {
                    const count = countGreenCandle(candles, signalCandle.openTime, candle.openTime)
                    if (count == 2) {
                        console.log("sell")
                        position = "sell"
                        await stream.write(tomcat.utils.toTimeEx(candle.openTime), { signal: "sell", candle: candle })
                    }
                }
            })


        pipeline.start(tomcat.utils.toTimeEx(Date.UTC(2021, 9, 1, 0, 0, 0, 0)))
        await tomcat.utils.delay(300 * 1000)
    })
})