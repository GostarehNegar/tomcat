import { CandleStickData } from "../../common";
import utils from "../../common/Domain.Utils";
import { DataServiceDefinition, getStreamName, IDataServiceParameters } from "../../contracts";
import { CCXTDataStream } from "../../exchanges";
import { IMeshServiceContext, MeshServiceBase } from "../../infrastructure/mesh";
import { CandleStreamWriter } from "../CandleStreamWriter";



export class CandleStreamMeshService extends MeshServiceBase {

    private params: IDataServiceParameters;
    constructor(def: DataServiceDefinition) {
        super(def);
        this.params = def.parameters;
        if (!def.parameters.interval) {

        }

    }
    async run(ctx?: IMeshServiceContext): Promise<unknown> {
        (ctx);
        const logger = utils.getLogger(this.definiton.getName());
        logger.criticalInfo(`DataService Starting: ${this.definiton.toString()}`)
        this.information.status = 'started';
        const source = new CCXTDataStream(this.params.exchange, this.params.symbol, this.params.market, this.params.interval);
        const name = getStreamName(this.params.exchange, this.params.symbol, this.params.market, this.params.interval)
        const start = source.getStartTime();


        const stream = ctx.ServiceProvider
            .getStoreFactory()
            .createStore({ provider: 'redis' })
            .getDataStream<CandleStickData>(name);
        const writer = new CandleStreamWriter(stream, source);
        await writer.start(start, (st) => {
            (st);
            return ctx.cancellationToken.isCancelled;
        });
        // while (! await ctx.shouldStop()) {

        // }
        // await Promise.resolve();
        logger.criticalInfo(`DataService Stopping: ${this.definiton.toString()}`)
        this.information.status = 'stop';
        return this.information;
    }

}