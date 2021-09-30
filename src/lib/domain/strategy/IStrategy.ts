import { CandleStickCollection } from "../base";

import { IStrategyContext } from "./IStrategyContext";

export interface IStrategy {
    run(cx: IStrategyContext): Promise<unknown>;
    name: string;
    stream: string;
    data: CandleStickCollection
}