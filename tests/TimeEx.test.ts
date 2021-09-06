import tomcat from '../src'

const TimeEx = tomcat.Index.Base.TimeEx
const TimeSpan = tomcat.Index.Base.TimeSpan

describe("utils", () => {
  test('timeEx', () => {
    const now = TimeEx.now();
    console.log(now.ticks);
  });
  test('timespan', () => {
    const span = TimeSpan.FromDates(
      TimeEx.now().asDate,
      TimeEx.now().asDate,
      true
    );

    console.log(`span ${span}`);
  });
  test("internet connection", async () => {
    await tomcat.utils.checkInternetConnection()
  })
  test("vpn connection", async () => {
    await tomcat.utils.checkVPNConnection()
  })
})
