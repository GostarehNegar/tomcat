import { dep_IIndicator } from "../data";


export interface IStrategyContext {
    startTime: number;
    endTime: number;
    adx?: { id: string; period: number; };
    atr?: { id: string; period: number; };
    minusDi?: { id: string; period: number; };
    plusDi?: { id: string; period: number; };
    sar?: { id: string; startIndex: number; acceleration: number; maxAcceleration: number; };
    customIndicators?: dep_IIndicator[];
}
