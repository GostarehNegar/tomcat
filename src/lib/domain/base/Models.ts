import { ICandleStickData, IHaveCandleStickData } from './_interfaces';

export abstract class CandelStickBase implements IHaveCandleStickData {
  constructor(data?: ICandleStickData | IHaveCandleStickData) {
    const _data: ICandleStickData =
      data == null
        ? null
        : typeof (data as IHaveCandleStickData).getCandle === 'function'
          ? (data as IHaveCandleStickData).getCandle()
          : (data as ICandleStickData);
    this.setCandle(_data);
  }
  abstract getCandle(): ICandleStickData;
  abstract setCandle(value: ICandleStickData);
}

export class CandleStickArrayModel
  extends CandelStickBase
  implements IHaveCandleStickData {
  private static _blank = [0, 0, 0, 0, 0, 0, 0, null, null, null, null, null];
  private _values: number[] = CandleStickArrayModel._blank;
  public get name(): string {
    return 'lll';
  }
  getCandle(): ICandleStickData {
    return {
      openTime: this._values[0],
      open: this._values[1],
      high: this._values[2],
      low: this._values[3],
      close: this._values[4],
      volume: this._values[5],
      closeTime: this._values[6],
      amount: this._values[7],
      V1: this._values[8],
      V2: this._values[9],
      V3: this._values[10],
      V4: this._values[11],
    };
  }
  setCandle(value: ICandleStickData) {
    this._values = CandleStickArrayModel._blank;
    this._values[0] = value.openTime;
    this._values[1] = value.open;
    this._values[2] = value.high;
    this._values[3] = value.low;
    this._values[4] = value.close;
    this._values[5] = value.volume;
    this._values[6] = value.closeTime;
    this._values[7] = value.amount;
    this._values[8] = value.V1;
    this._values[9] = value.V2;
    this._values[10] = value.V3;
    this._values[11] = value.V4;
  }
}
