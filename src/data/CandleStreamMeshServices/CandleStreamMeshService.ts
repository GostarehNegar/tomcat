import { CandleStickData } from "../../common";
import utils from "../../common/Domain.Utils";
import { DataServiceDefinition, dataStreamPayload, getStreamName, IDataServiceParameters, playDataStreamReply, playDataStreamRequest, queryDataStreamNamePayload, queryDataStreamNameReply } from "../../contracts";
import { Contracts } from "../../domain";
import { CCXTDataStream } from "../../exchanges";
import { CancellationToken, CancellationTokenSource, IServiceProvider } from "../../infrastructure/base";
import { IMessageContext } from "../../infrastructure/bus";
import { IDataStream } from "../../infrastructure/data/IDataSream";
import { IMeshServiceContext, MeshServiceBase } from "../../infrastructure/mesh";
import { CandleStreamWriter } from "../CandleStreamWriter";





class CandleStreamMeshServiceHelper {

    _started = false;
    services: CandleStreamMeshService[] = [];
    token = new CancellationTokenSource();
    constructor(public serviceProvider: IServiceProvider) {

    }
    startPlay(token: CancellationToken, stream: IDataStream<CandleStickData>, options: playDataStreamRequest, to: string) {
        const bus = this.serviceProvider.getBus();
        (to);
        let failed = 0;
        let failed_once = 0;
        stream.play(async (c, i) => {
            (c);
            (i);
            try {
                await utils.delay(failed_once * 10 + failed * 10);
                const payload: dataStreamPayload = {
                    candels: [],
                }
                payload.candels.push(c);
                const reply = await bus.createMessage(options.channel, payload, to).execute();
                if (failed > 0)
                    failed--;
                (reply)

            }
            catch (err) {
                (err)
                failed++;
                failed_once = 1;

            }

            return token.isCancelled || failed > 3;


        }, options.start);



    }
    async handleQureyName(ctx: IMessageContext) {
        const query = ctx.message.cast<queryDataStreamNamePayload>();

        const service = this.services
            .find(s => s.params.exchange === query.exchange &&
                s.params.interval === query.interval && s.params.symbol === query.symbol &&
                s.params.market === query.market);
        if (service) {
            const reply: queryDataStreamNameReply = {
                streamName: service.getStreamName(),
                redis: 'redis://localhost:6379',
            }
            await ctx.reply(reply);
        }
        else {

        }

    }
    async handlePlay(ctx: IMessageContext) {
        const query = ctx.message.cast<playDataStreamRequest>();
        const reply: playDataStreamReply = null;
        (query)
        const service = this.services
            .find(s => s.params.exchange === query.exchange &&
                s.params.interval === query.interval && s.params.symbol === query.symbol &&
                s.params.market === query.market);
        if (service) {
            const stream = this.serviceProvider
                .getStoreFactory()
                .createStore({ 'provider': 'redis' })
                .getDataStream<CandleStickData>(service.getStreamName())

            this.startPlay(this.token, stream, query, ctx.message.from);
            reply.channel = query.channel;
            ctx.reply(reply);

        }
        else {

        }

        // const service = this.services
        //     .find(s => s.params.exchange === query.exchange &&
        //         s.params.interval === query.interval && s.params.symbol === query.symbol &&
        //         s.params.market === query.market);
        // if (service) {
        //     const reply: queryDataStreamNameReply = {
        //         streamName: service.getStreamName(),
        //         redis: 'redis://localhost:6379',
        //     }
        //     await ctx.reply(reply);
        // }
        // else {

        // }

    }
    async start(): Promise<boolean> {
        if (!this._started) {
            this._started = true;
            const bus = this.serviceProvider.getBus();
            await bus.subscribe(Contracts.queryDataStreamName(null).topic, ctx => this.handleQureyName(ctx));
            await bus.subscribe(Contracts.requestDataStreamPlay(null).topic, ctx => this.handlePlay(ctx));
        }
        return this._started;
    }
    async stop(): Promise<boolean> {
        if (this._started) {
            this._started = false;

        }
        return this._started;
    }

    static _instance: CandleStreamMeshServiceHelper;
    static getInstance(service: CandleStreamMeshService, ctx: IMeshServiceContext): CandleStreamMeshServiceHelper {
        if (!this._instance) {
            this._instance = new CandleStreamMeshServiceHelper(ctx.ServiceProvider);
        }
        if (!this._instance.services.find(x => x.uinque_id == service.uinque_id))
            this._instance.services.push(service);
        return this._instance
    }

}



export class CandleStreamMeshService extends MeshServiceBase {

    public params: IDataServiceParameters;
    public uinque_id;
    constructor(def: DataServiceDefinition) {
        super(def);
        this.params = def.parameters;
        this.uinque_id = utils.UUID();
    }
    getStreamName(): string {
        return getStreamName(this.params.exchange, this.params.symbol, this.params.market, this.params.interval);

    }

    async run(ctx?: IMeshServiceContext): Promise<unknown> {
        (ctx);
        const helper = CandleStreamMeshServiceHelper.getInstance(this, ctx);
        (helper);
        await helper.start();
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