import { IndicatorValueCollection } from "./IndicatorValueCollection";


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
    indicators?: IndicatorValueCollection;
}
