import { CandleStickData } from "../common";

export interface IPlay {
    (candle: CandleStickData, err): Promise<boolean>;
}
