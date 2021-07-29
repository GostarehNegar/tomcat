import { TimeEx } from '../../base/TimeEx';

export interface IExchange {
  getServerTime(): Promise<TimeEx>;
  get CurrenTime(): TimeEx;
}
