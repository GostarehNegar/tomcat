import { TimeEx } from "../infrastructure/base";


export interface IExchange {
    getServerTime(): Promise<TimeEx>;
    get CurrenTime(): TimeEx;
}
