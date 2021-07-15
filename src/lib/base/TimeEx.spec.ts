import test from 'ava';

import { TimeEx, TimeSpan } from './TimeEx'

test('timeEx', (t) => {
    const now = TimeEx.now();
    console.log(now.ticks)
    t.true(true)


});
test('timespan', (t) => {
    const span = TimeSpan.FromDates(TimeEx.now().asDate, TimeEx.now().asDate, true);

    console.log(`span ${span}`);
    t.true(true)


});