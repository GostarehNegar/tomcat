import { BaseUtils } from '../infrastructure/base';

import { Intervals } from '.';

export class Utils extends BaseUtils {
    roundTime(time: number, minutes: number): number {
        const coeff = 1000 * 60 * minutes;
        return Math.round(time / coeff) * coeff;
    }
    //var roundToNearestMinute = function (date) {
    //     var coeff = 1000 * 60 * 1; // <-- Replace {5} with interval

    //     return new Date(Math.round(date.getTime() / coeff) * coeff);
    // };
    toMinutes(interval: Intervals): number {
        if (interval == null)
            return null;
        const _interval = interval.trim().toLowerCase();
        if (_interval.length == 0)
            return null;
        if (_interval.endsWith('m'))
            return Number.parseInt(_interval);
        if (_interval.endsWith('h'))
            return Number.parseInt(_interval) * 60;
        if (_interval.endsWith('d'))
            return Number.parseInt(_interval) * 60 * 24;
        return null;
    }
}
const utils = new Utils();
export default utils;