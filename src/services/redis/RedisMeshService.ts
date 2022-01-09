
import { RedisProcessAdapter } from '.';
import utils from '../../common/Domain.Utils';
import { queryRedisOptionsPayload, redisServiceDefinition } from '../../contracts';

import { baseUtils, ILogger } from '../../infrastructure/base';
import { IMessageContext } from '../../infrastructure/bus';
import { IMeshService, IMeshServiceContext, matchService, ServiceCategories, ServiceDefinition, ServiceInformation, ServiceStatus } from '../../infrastructure/mesh';
import { RedisClientOptions, RedisUtils } from '../../infrastructure/services';
import { IProcess, IProcessManager } from '../../infrastructure/services/processManager/IProcessManager';

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
    public process: IProcess;
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
        this._adapter = null;
    }
    async startWithRedisServer(manager: IProcessManager, name: string, port: number, dir: string): Promise<IProcess> {
        //var dir = await utils.getRedisDataDirectory(name);
        const redis_server = await RedisUtils.InstallRedis();
        this.process = manager.create(name)
            .spawn(redis_server, ['--port', port.toString(), '--dir', dir]);
        return this.process;
    }
    async startWithDocker(manager: IProcessManager, name: string, port: number, dir: string): Promise<IProcess> {
        //var dir = await utils.getRedisDataDirectory(name);
        this.process = manager.create(name)
            .spawn("docker", ["run", "-d", "-p", `${port}:6379`, "-v", `${dir}:/data`, "--name", name, "redis"]);
        return this.process;
    }
    async start(ctx?: IMeshServiceContext): Promise<unknown> {
        (ctx)
        if (this.status !== 'start') {
            try {
                const in_docker = await utils.isInDocker();
                const port: number = parseInt(this.portNumber);
                const name = this.containerName;
                const dir = await utils.getRedisDataDirectory(name);
                if (in_docker) {
                    this.process = await this
                        .startWithRedisServer(ctx.ServiceProvider.getProcessManager(), name, port, dir)
                }
                else {
                    this.process = await this.startWithDocker(ctx.ServiceProvider.getProcessManager(), name, port, dir);

                }
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
                connectionString: `redis://localhost:${this.portNumber}`,
                host: ''
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
        const params = definition.parameters;
        params.type = params.type || 'shared';
        params.port = (params.port && isFinite(parseInt(params.port)) ? parseInt(params.port) : 3679).toString();
        params.name = params.name || `redis-${params.port}`;
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
    public static async handle(ctx: IMessageContext) {
        var request = ctx.message.cast<queryRedisOptionsPayload>();
        if (!request || !request.name || request.name === '') {
            throw utils.toException('invalid request.')
        }
        let service: RedisMeshService = null;
        switch (request.repository_type) {
            case 'exclusive':
                /// 
                service = utils.from(this._instances)
                    .firstOrDefault(x => x.definition.parameters.name === request.name);
                if (!service) {
                    service = this.GetOrCreate({
                        category: 'redis',
                        parameters: {
                            name: request.name,
                            port: (await utils.findPort(3600, 3800)).toString()
                        }
                    })
                }

                break;
            case 'shared':
                // 
                service = this.GetOrCreate(
                    {
                        category: 'redis',
                        parameters: {
                            port: '3679',
                            name: 'redis'
                        }
                    })
                break;
        }
        var info = service.getInformation();

        var options: RedisClientOptions = {
            host: info.parameters.host,
            port: info.parameters.port,
            keyPrefix: request.name + ':',

        };

        return options;


    }

}
