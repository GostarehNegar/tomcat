import { TimeEx } from '../../base/implementations/TimeEx';


export interface IExchange {
    getServerTime(): Promise<TimeEx>;
    get CurrenTime(): TimeEx;
}
