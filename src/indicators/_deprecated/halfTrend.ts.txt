import tomcat from '@gostarehnegar/tomcat'
type Intervals = tomcat.Domain.Base.Intervals
type IIndicator = tomcat.Domain.Indicators.IIndicator
type IFilter = tomcat.Domain.Pipes.IFilter
type CandleStickData = tomcat.Domain.Base.CandleStickData
type CandleStickCollection = tomcat.Domain.Base.CandleStickCollection

import { TalibWrapperEx } from "./talibWrapper"

export const HTSignal = (amplitude = 2, channelDeviation = 2, maxCount = 200, interval: Intervals = '4h'): IIndicator => {
    return {
        handler: null,
        id: `Ht-SIGNAL-${amplitude}-${channelDeviation}-${maxCount}-${interval}`
    }
}
export const HTTrend = (amplitude = 2, channelDeviation = 2, maxCount = 200, interval: Intervals = '4h'): IIndicator => {
    return {
        handler: null,
        id: `Ht-TREND-${amplitude}-${channelDeviation}-${maxCount}-${interval}`
    }
}
export const HalfTrend = (amplitude = 2, channelDeviation = 2, maxCount = 200, interval: Intervals = '4h'): IIndicator => {
    const id = `HT-${amplitude}-${channelDeviation}-${maxCount}-${interval}`
    const signal = HTSignal(amplitude, channelDeviation, maxCount, interval)
    const trend = HTTrend(amplitude, channelDeviation, maxCount, interval)
    return {
        handler: async (candle: CandleStickData, THIS: IFilter) => {
            const candles = THIS.getScaler(interval, maxCount).push(candle)
            const ATRArray = await TalibWrapperEx.execute({
                name: "ATR",
                high: candles.getLast(maxCount).getSingleOHLCV('high'),
                low: candles.getLast(maxCount).getSingleOHLCV('low'),
                close: candles.getLast(maxCount).getSingleOHLCV('close'),
                startIdx: 0,
                endIdx: candles.getLast(maxCount).length - 1,
                optInTimePeriod: 100,
            }) as number[]
            const SMAHighArray = await TalibWrapperEx.execute({
                name: "SMA",
                startIdx: 0,
                endIdx: candles.getLast(maxCount).length - 1,
                inReal: candles.getLast(maxCount).getSingleOHLCV('high'),
                optInTimePeriod: amplitude
            }) as number[]
            const SMALowArray = await TalibWrapperEx.execute({
                name: "SMA",
                startIdx: 0,
                endIdx: candles.getLast(maxCount).length - 1,
                inReal: candles.getLast(maxCount).getSingleOHLCV('low'),
                optInTimePeriod: amplitude
            }) as number[]
            for (let i = ATRArray.length; i < candles.length; i++) {
                ATRArray.unshift(NaN)
            }
            for (let i = SMAHighArray.length; i < candles.length; i++) {
                SMAHighArray.unshift(NaN)
            }
            for (let i = SMALowArray.length; i < candles.length; i++) {
                SMALowArray.unshift(NaN)
            }
            // candle.indicators.setValue(id, ADXArray[ADXArray.length - 1])
            const res = calculateHalfTrend(candles, ATRArray, SMALowArray, SMAHighArray, channelDeviation, amplitude)
            const halfTrend = res[res.length - 1]
            if (halfTrend) {
                candle.indicators.setValue(id, halfTrend.ht)
                candle.indicators.setValue(trend, halfTrend.trend)
                if (signal) {
                    candle.indicators.setValue(signal, halfTrend.signal)
                }
            }
        },
        id: id,
    }
}
const nz = (x: number, y: number) => {
    return isNaN(x) ? y : x
}
// const highestbars = (candles: CandleStickCollection, length: number): number => {
//     let maxVal = -100000
//     for (let i = 0; i < length; i++) {
//         if (candles.items[candles.length - i - 1].high > maxVal) {
//             maxVal = candles.items[i].high
//         }
//     }
//     return maxVal
// }

// const lowestbars = (candles: CandleStickCollection, length: number): number => {
//     let minval = 100000
//     for (let i = 0; i < length; i++) {
//         if (candles.items[candles.length - i - 1].low < minval) {
//             minval = candles.items[i].low
//         }
//     }
//     return minval
// }
// const calculateHalfTrend_dep = (candles: CandleStickCollection, atr: number, smaLow: number, smaHigh: number, channelDeviation: number, amplitude: number) => {
//     let candle = candles.items[candles.length - 1]
//     let candle_1 = candles.items[candles.length - 2]
//     let low_1 = candle_1.low
//     let low = candle.low
//     let high = candle.high
//     let high_1 = candle_1.high
//     let trend = 0
//     let nextTrend = 0
//     let maxLowPrice = nz(low_1, low)
//     let minHighPrice = nz(high_1, high)

//     let up = 0.0
//     let down = 0.0
//     let atrHigh = 0.0
//     let atrLow = 0.0
//     let arrowUp = NaN
//     let arrowDown = NaN

//     let atr2 = atr / 2
//     let dev = channelDeviation * atr2

//     let lowPrice = lowestbars(candles, amplitude)
//     let highPrice = highestbars(candles, amplitude)
// }
const max = (x: number, y: number) => {
    return x > y ? x : y
}
const min = (x: number, y: number) => {
    return x < y ? x : y
}

const calculateHalfTrend = (candles: CandleStickCollection, atr: number[], smaLow: number[], smaHigh: number[], channelDeviation: number, amplitude: number) => {
    (channelDeviation)
    const result = []

    let trend = NaN
    let nextTrend = 0
    let maxLowPrice = candles.items[0].low
    let minHighPrice = candles.items[0].high
    let up = NaN
    let down = NaN
    // let atrHigh = NaN
    // let atrLow = NaN
    let arrowUp = NaN
    let arrowDown = NaN
    let ht = NaN
    let trend_1 = NaN
    let down_1 = NaN
    let up_1 = NaN
    result.push(null)
    for (let i = 1; i < candles.length; i++) {
        const candle = candles.items[i]
        const close = candle.close
        const candle_1 = candles.items[i - 1]
        const low_1 = candle_1.low
        const low = candle.low
        const high = candle.high
        const high_1 = candle_1.high
        let lowPrice = NaN
        let highPrice = NaN

        // let dev = channelDeviation * atr2
        if (i < amplitude || isNaN(atr[i]) || isNaN(smaHigh[i]) || isNaN(smaLow[i])) {
            result.push(null)
            continue
        } else {
            const lowma = smaLow[i]
            const highma = smaHigh[i]
            const atr2 = atr[i] / 2
            lowPrice = 100000
            highPrice = -100000
            for (let j = amplitude - 1; j >= 0; j--) {
                const target = candles.items[i - j]
                if (target.high > highPrice) {
                    highPrice = target.high
                }
                if (target.low < lowPrice) {
                    lowPrice = target.low
                }
            }

            if (nextTrend == 1) {
                maxLowPrice = max(lowPrice, maxLowPrice)
                if (highma < maxLowPrice && close < nz(low_1, low)) {
                    trend = 1
                    nextTrend = 0
                    minHighPrice = highPrice
                }
            } else {
                minHighPrice = min(highPrice, minHighPrice)
                if (lowma > minHighPrice && close > nz(high_1, high)) {
                    trend = 0
                    nextTrend = 1
                    maxLowPrice = lowPrice
                }
            }
            if (trend == 0) {
                // if (not na(trend[1]) and trend[1] != 0)
                if (!isNaN(trend_1) && trend_1 != 0) {
                    up = isNaN(down_1) ? down : down_1
                    arrowUp = up - atr2

                } else {
                    up = isNaN(up_1) ? maxLowPrice : max(maxLowPrice, up_1)

                }
            } else {
                if (!isNaN(trend_1) && trend_1 != 1) {
                    down = isNaN(up_1) ? up : up_1
                    arrowDown = down + atr2
                } else {
                    down = isNaN(down_1) ? minHighPrice : min(minHighPrice, down_1)
                }
            }
            const buySignal = !isNaN(arrowUp) && (trend == 0 && trend_1 == 1)
            //not na(arrowUp) and (trend == 0 and trend[1] == 1)
            const sellSignal = !isNaN(arrowDown) && (trend == 1 && trend_1 == 0)
            //not na(arrowDown) and (trend == 1 and trend[1] == 0)
            ht = trend == 0 ? up : down
            result.push({ ht: ht, trend: trend, signal: buySignal ? "buy" : sellSignal ? "sell" : null })
            up_1 = up
            down_1 = down
            trend_1 = trend
        }
    }
    return result
}