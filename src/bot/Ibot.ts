import { Exchanges, Intervals, Markets, Symbols } from "../common";
import utils from "../common/Domain.Utils";
import { DataServiceDefinition, getStreamName } from "../contracts";
import { requireService } from "../infrastructure/contracts";
import { IMeshService, IMeshServiceContext, IServiceDefinitionParameters, ServiceCategories, ServiceDefinitionBase, ServiceInformation } from "../infrastructure/mesh";
import { Pipeline } from "../pipes";

export interface IBot extends IMeshService {

}
export interface BotServiceDefinitionParameters extends IServiceDefinitionParameters {
    exchange: Exchanges,
    interval: Intervals,
    market: Markets,
    symbol: Symbols,
    name: string
}
export class BotServiceDefinition extends ServiceDefinitionBase<BotServiceDefinitionParameters>{
    public category: ServiceCategories = "strategy"
}
export abstract class Bot implements IBot {
    public info: ServiceInformation
    constructor(public definition: BotServiceDefinition) {
        // this.info = { definition: definition, status: "unknown" }
        this.info = new ServiceInformation(definition)
    }
    async run(ctx?: IMeshServiceContext): Promise<void> {
        const def: DataServiceDefinition = { category: 'data', parameters: { exchange: this.definition.parameters.exchange, interval: this.definition.parameters.interval, market: this.definition.parameters.market, symbol: this.definition.parameters.symbol } }
        const message = ctx.ServiceProvider.getBus().createMessage(requireService(def))
        const reply = await message.execute(undefined, 40000, true);
        (reply)
        const streamName = getStreamName(this.definition.parameters.exchange, this.definition.parameters.symbol, this.definition.parameters.market, this.definition.parameters.interval)
        const pipeline = new Pipeline().fromStream2(streamName)
        await this.initializePipeline(pipeline)
        await pipeline.startEx(utils.toTimeEx(Date.UTC(2021, 0, 1)), () => {
            return ctx.cancellationToken.isCancelled
        })
    }
    abstract initializePipeline(pipeline: Pipeline): Promise<Pipeline>
}
export interface IWallet {
    buy(time, price)
    sell(time, price)
}
const STOP = utils.toTimeEx(Date.now()).ticks
export class MohsenBot extends Bot {
    constructor(public def: BotServiceDefinition) {
        super(def)
    }
    async initializePipeline(pipeline: Pipeline): Promise<Pipeline> {
        pipeline.add(async (candle) => {
            if (candle.openTime >= STOP) {
                console.log(("done"));
            }

        })
        return pipeline
    }

}
