import { TimeEx } from "../../base";


export interface IExchange {
    getServerTime(): Promise<TimeEx>;
    get CurrenTime(): TimeEx;
}
