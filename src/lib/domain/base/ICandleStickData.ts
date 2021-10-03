import { IndicatorValueCollection } from "./IndicatorValueCollection";

export type ISignalValues = { [index: string]: string };

export interface ICandleStickData {
    openTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    closeTime: number;
    volume?: number;
    amount?: number;
    V1?: number;
    V2?: number;
    V3?: number;
    V4?: number;
    // indicators_deprecated?: { [index: string]: number };
    signals?: ISignalValues;
    indicators?: IndicatorValueCollection;
}
