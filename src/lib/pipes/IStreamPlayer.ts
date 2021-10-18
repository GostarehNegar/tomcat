import { Ticks } from "../infrastructure/base";

import { IPlay } from "./IPlay";

export interface IStreamPlayer {
    (cb: IPlay, startTime?: Ticks, timeOut?, count?, generateMissingCandles?);
}
