import tomcat from "../src"

const IndicatorDB = tomcat.Index.Domain.Data.IndicatorDB

jest.setTimeout(5 * 60 * 1000)
describe("indicatorCache", () => {
    test("test indicatorCache", async () => {
        const indicatorCache = new IndicatorDB()

        await indicatorCache.setIndicatorValue(1, "a", 1)
        const a = await indicatorCache.getIndicatorValue(1, 'a')
        expect(a.value).toBe(1)
    })
})