import { TimeEx, utils } from "../../base";
import { IMessageBus } from "../../bus";
import { CandleStickCollection } from "../base";
import { IndicatorCalculationContext } from "../data";

import { MessageNames } from "./messages";

class Event {
    public payload: string;
    public topic: string;
    public streamID: string;
    constructor(topic: string, payload?: unknown) {
        this.payload = payload ? JSON.stringify(payload) : "";
        const a = topic.indexOf("/")
        if (a < 0) {
            throw "invalid Topic"
        }
        this.streamID = topic.substring(0, a)
        this.topic = topic.substring(a + 1)
    }
}

export class JobContext {
    public ID;
    public candles: CandleStickCollection;
    public indicatorCalculationContext: IndicatorCalculationContext;
    public bus: IMessageBus
    public events: Event[];
    public startTime: TimeEx;
    public endTime: TimeEx;
    constructor(bus: IMessageBus) {
        //bus , name , joborder 
        this.ID = Math.floor(Math.random() * 1000)
        this.candles = new CandleStickCollection([]);
        this.indicatorCalculationContext = new IndicatorCalculationContext(this.candles)
        this.events = [];
        this.bus = bus
        this.bus.subscribe(`${this.streamID}/*`, async (ctx) => {
            this.events.push(new Event(ctx.message.topic, ctx.message.payload))
            this.apply(this.events[this.events.length - 1])
        })
    }
    apply(event: Event) {
        switch (event.topic) {
            case MessageNames.started:
                this.startTime = utils.toTimeEx(JSON.parse(event.payload))
                break;
            case MessageNames.ended:
                this.endTime = utils.toTimeEx(JSON.parse(event.payload))
                break;
            default:
                break;
        }
    }
    play() {
        //playback events
    }
    get streamID() {
        return this.ID
    }

}