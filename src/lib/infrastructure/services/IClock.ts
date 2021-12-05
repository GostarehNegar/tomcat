import { TimeEx } from "../base";

/// http://worldclockapi.com/api/json/utc/now
/// http://worldtimeapi.org/api/timezone/etc/utc

export interface IClock {
    now(): number;
    timeNow(): TimeEx;
    synch(): Promise<number>;
    setInterval(cb: () => void, ms?: number): NodeJS.Timer;

}
