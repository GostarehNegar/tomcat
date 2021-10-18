import { ICandleStickData } from "./ICandleStickData";

export interface IHaveCandleStickData {
    getCandle(): ICandleStickData;
    setCandle(value: ICandleStickData);
}
