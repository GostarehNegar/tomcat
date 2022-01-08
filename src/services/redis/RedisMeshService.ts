import { ChildProcessWithoutNullStreams } from 'child_process';
import { RedisProcessAdapter } from '.';
import { queryRedisOptionsPayload, redisServiceDefinition } from '../../contracts';

import { baseUtils, ILogger } from '../../infrastructure/base';
import { IMessageContext } from '../../infrastructure/bus';
import { IMeshService, IMeshServiceContext, matchService, ServiceCategories, ServiceDefinition, ServiceInformation, ServiceStatus } from '../../infrastructure/mesh';
import { RedisClientOptions } from '../../infrastructure/services';

export type redisInfo = {
    dataDrirectory: string,
    portNumber: string,
    containerID: string,
}
/**
 * Provides redis as a mesh service. This is used
 * by redis nodes to provide redis services.
 */

export class RedisMeshService implements IMeshService {
    public process: ChildProcessWithoutNullStreams;
    public containerName: string;
    public portNumber: string;
    public dataDirectory: string;
    public containerId: string;
    public isReady: boolean;
    public status: ServiceStatus = 'unknown';
    public Id: string = baseUtils.UUID();
    public logger: ILogger;
    private static _instances: RedisMeshService[] = [];
    public definition: redisServiceDefinition;
    private _adapter: RedisProcessAdapter;
    constructor(public def: ServiceDefinition) {
        this.definition = def as redisServiceDefinition;
        this.logger = baseUtils.getLogger("RedisService");
        this.containerName = (this.def.parameters && this.def.parameters["name"]) as string || baseUtils.randomName("redis");
        this.portNumber = this.def.parameters && this.def["port"] as string;
        this.dataDirectory = (this.def.parameters && this.def["dataPath"]) || `/home/paria/Desktop/a/${this.containerName}`;
        this._adapter = new RedisProcessAdapter();
    }
    async start(ctx?: IMeshServiceContext): Promise<unknown> {
        (ctx)
        //if (this.status!= 'start')
        if (this.status !== 'start') {
            try {
                await this._adapter.start({
                    port: this.portNumber ? Number(this.portNumber) : null,
                    containerName: this.containerName
                });
                this.status = 'start';
            }
            catch (err) {
                this.logger.error(
                    `An error occured while trying to spawn a new redis instance. Err:${err}`)

            }
        }
        return this.getInformation();

    }
    getInformation(): ServiceInformation {
        return {
            category: "redis" as ServiceCategories,
            parameters:
            {
                port: this._adapter.info.port, // this.portNumber,
                dataDir: this._adapter.containerInfo.dataDirectory,//  this.dataDirectory,
                containerID: this._adapter.containerInfo.containerID,// this.containerId,
                redisName: this._adapter.containerInfo.containerName,
                connectionString: `redis://localhost:${this.portNumber}`
            },
            status: this.status
        };
    }
    /**
     * Gets or Creates a 'RedisMeshService' based on the required service definition.
     * It creates a new redis if the rquiremens cannnot be fullfilled with the existing
     * connections.
     * @param definition 
     */
    public static GetOrCreate(definition: redisServiceDefinition): RedisMeshService {
        (definition);
        (this._instances);
        let service: RedisMeshService = null;
        // We should search thru _instances to find a 
        // corresponding service.
        for (let idx = 0; idx < this._instances.length; idx++) {
            const _service = this._instances[idx];
            //const matches = _service.definition.parameters.name == definition.parameters.name;
            const matches = matchService(_service.definition, definition);
            if (matches) {
                service = _service;
                break;
            }
        }
        if (!service) {
            service = new RedisMeshService(definition);
            this._instances.push(service);
        }
        return service;
    }
    /**
     * Handles a queryRedisOptions request and provides
     * @param request 
     */
    public static handle(ctx: IMessageContext) {
        var request = ctx.message.cast<queryRedisOptionsPayload>();
        (request);
        var options: RedisClientOptions = {

        };

        return options;


    }

}
