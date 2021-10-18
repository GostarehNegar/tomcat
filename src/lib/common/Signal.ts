import { CandleStickData, Signals } from ".";


export class Signal {
    constructor(public signal: Signals, public candle: CandleStickData, public stopLoss: number, public reason?: string) { }
}
