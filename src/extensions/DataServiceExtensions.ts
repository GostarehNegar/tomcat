import { Exchanges, Intervals, Markets, Symbols } from "../common";
import { IStopCallBack } from "../common/IStopCallBack";
import { playDataStreamReply, requestDataStreamPlay } from "../contracts";
import { Ticks } from "../infrastructure/base";

import { IMessageBus } from "../infrastructure/bus";

export async function requestDataReply(bus: IMessageBus,
    exchange: Exchanges, interval: Intervals, symbol: Symbols, market: Markets,
    channelName: string, startTime: Ticks,
    callback: IStopCallBack): Promise<playDataStreamReply> {
    const reply = await bus.createMessage(requestDataStreamPlay({
        exchange: exchange,
        'interval': interval,
        'market': market,
        symbol: symbol,
        channel: channelName,
        start: startTime

    })).execute();

    await bus.subscribe(channelName, async (ctx) => {



    })
    return reply.cast<playDataStreamReply>();

}