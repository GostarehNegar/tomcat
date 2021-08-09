import { TimeEx } from '../../base/internals/TimeEx';


export interface IExchange {
    getServerTime(): Promise<TimeEx>;
    get CurrenTime(): TimeEx;
}
