import test from 'ava';

import { BinanceExchange } from './Binance.Exchange';

test('exganges.binance', async (t) => {
  const target = new BinanceExchange();
  const time = await target.getServerTime();
  t.true(time.ticks > 0);
});
