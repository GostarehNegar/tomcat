
import { IDataSource } from ".";
import { CandleStickData } from "../common";
import utils from "../common/Domain.Utils";
import { IStopCallBack } from "../common/IStopCallBack";
import { ILogger, Ticks } from "../infrastructure/base";
import { IDataStream } from "../infrastructure/data/IDataSream";

export class CandleStreamWriter {

    private logger: ILogger = utils.getLogger("CandleStreamWRiter")
    constructor(public stream: IDataStream<CandleStickData>, public source: IDataSource) {

    }
    async start(startTime?: Ticks, stop?: IStopCallBack) {
        let lastCandle = await this.stream.getLast();
        startTime = utils.ticks(startTime);
        startTime = startTime || lastCandle?.openTime;
        const interval = utils.toMinutes(this.source.interval) * 60 * 1000;
        let should_stop = false;
        await this.source.play(async candles => {
            let populate_start = 0;
            if (candles && candles.length > 0) {
                populate_start = lastCandle
                    ? lastCandle.openTime + interval
                    : candles.items[0].openTime;
                candles.populate(utils.ticks(populate_start), utils.ticks(candles.endTime))
                for (let i = 0; i < candles.length; i++) {
                    const candle = candles.items[i];
                    let success = false;
                    while (!success) {
                        try {
                            await this.stream.add(candle, candle.openTime);
                            success = true;
                        }
                        catch (err) {
                            this.logger.error(
                                `An error occured while trying to add candle to Stream. Err:${err}`);
                            should_stop = stop && stop({ err: err })
                            if (should_stop)
                                break;
                            await utils.delay(5 * 1000);
                        }
                    }
                    if (should_stop) {
                        break;
                    }

                }

            }
        }, startTime, stp => {
            return should_stop || (stop && stop(stp));
        });
    }
}

