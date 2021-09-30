import tomcat from "../src"

const BinanceDataSource = tomcat.Index.Domain.Exchange.BinanceDataSource
const CandleStream = tomcat.Index.Domain.Data.CandleStream
const Pipeline = tomcat.Index.Domain.Strategy.Pipeline
const Indicators = tomcat.Index.Domain.Indicators

jest.setTimeout(500000)
describe("pipeline", () => {
    test('first', async () => {
        const myDataProvider = new BinanceDataSource('spot', 'BTCUSDT', '1m');
        const target = new CandleStream(myDataProvider, "test" + Math.floor(Math.random() * 100))
        const pipeline = new Pipeline(target)
        pipeline.add(async (candle) => {
            console.log(candle);
        }, { stream: true, name: "Filter-" + Math.floor(Math.random() * 100) })
            .add(async (candle) => {
                console.log(candle)
            })
        await pipeline.start(tomcat.utils.toTimeEx().addMinutes(-60 * 24))
        await tomcat.utils.delay(50 * 1000)
        const filterStream = new CandleStream(myDataProvider, pipeline.filters[0].name)
        expect(await target.getCount()).toBe(await filterStream.getCount())

    })
    test('indicator', async () => {
        const pipeline = new Pipeline()
        pipeline.from('binance', 'spot', 'BTCUSDT', '1m', "paria")
            .add(Indicators.ATR())
            .add(Indicators.ADX())
            .add(Indicators.MDI())
            .add(Indicators.PDI())
            .add(Indicators.SAR(), { stream: true, name: "FILTER-8000" })

        await pipeline.start(tomcat.utils.toTimeEx().addMinutes(-60 * 24))
        await tomcat.utils.delay(50 * 1000)

    })

})
// new bot().add Strategy("name").addDataSource(binance , spot ,...).add(filter).backtest()
// new strategy (binance , spot , ....).add(filter).start()