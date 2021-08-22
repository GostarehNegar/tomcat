import { CandleStickCollection } from "../base";
import { IStrategyContext } from "../bot/bot";

export interface IStrategy {
    run(cx: IStrategyContext): Promise<unknown>;
    stream: string;
    data: CandleStickCollection
}