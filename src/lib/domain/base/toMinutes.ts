import { Intervals } from "./Intervals";


export function toMinutes(interval: Intervals): number {
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
