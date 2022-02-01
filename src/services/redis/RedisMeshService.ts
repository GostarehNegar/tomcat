

import utils from '../../common/Domain.Utils';
import { IRedisServiceInformationParameters, queryRedisOptionsPayload, redisServiceDefinition } from '../../contracts';

import { baseUtils, ILogger } from '../../infrastructure/base';
import { IMessageContext } from '../../infrastructure/bus';
import { IMeshService, IMeshServiceContext, matchService, ServiceCategories, ServiceDefinition, ServiceInformation, ServiceStatus } from '../../infrastructure/mesh';
import { MeshServiceContext } from '../../infrastructure/mesh/MeshServiceContext';
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
    public isReady: boolean;
    public status: ServiceStatus = 'unknown';
    public Id: string = baseUtils.UUID();
    public logger: ILogger;
    private static _instances: RedisMeshService[] = [];
    public definition: redisServiceDefinition;
    private info: IRedisServiceInformationParameters = { schema: '' };

    constructor(public def: ServiceDefinition) {
        this.definition = def as redisServiceDefinition;
        this.logger = baseUtils.getLogger("RedisService");
    }
    async startWithRedisServer(manager: IProcessManager, name: string, port: number, dir: string): Promise<IProcess> {
        //var dir = await utils.getRedisDataDirectory(name);
        const redis_server = await RedisUtils.InstallRedis();
        this.logger.info(
            `spawning new redis process: port: ${port}, --dir:${dir}`
        )
        this.process = manager.create(name)
            .spawn(redis_server, ['--port', port.toString(), '--dir', dir, '--requirepass', 'tomcat_p@ssw0rd']);
        return this.process;
    }
    async startWithDocker(manager: IProcessManager, name: string, port: number, dir: string): Promise<IProcess> {
        //var dir = await utils.getRedisDataDirectory(name);
        this.process = manager.create(name)
            .spawn("docker", ["run", "-d", "-p", `${port}:6379`, "-v", `${dir}:/data`, "--name", name, "redis"]);
        return this.process;
    }
    async run(ctx?: IMeshServiceContext): Promise<ServiceInformation> {
        (ctx)
        if (this.status !== 'start') {
            try {
                this.logger.info(
                    `Trying to provision redis service. Params:${this.definition.parameters}`
                )
                const in_docker = true;// await utils.isInDocker();
                const exclusive = this.definition.parameters.server_name;
                if (exclusive && exclusive != "") {
                    // We should spin up a new instance of
                    // redis.
                    this.info.port = (await utils.findPort(6300, 6400));
                    this.info.schema = this.definition.parameters.schema;
                    this.info.dataPath = await utils.getRedisDataDirectory(this.definition.parameters.server_name);
                    this.info.server_name = this.definition.parameters.server_name;
                }
                else {
                    // We do not need a new instance of redis if there
                    // exists one.
                    this.info.port = 6379;
                    this.info.dataPath = await utils.getRedisDataDirectory('redis');
                    this.info.schema = this.definition.parameters.schema || 'default-perfix';
                    this.info.server_name = "redis-default-server"
                    this.info.host = utils.ipAddress();
                }
                ///
                /// At this point we know that we need redis
                /// localhost:port
                /// if we have this redis instance we do not need
                /// a new one.
                var redis_factory = ctx.ServiceProvider.getRedisFactory();
                const process_name = this.info.server_name;
                const processManager = ctx.ServiceProvider.getProcessManager();
                this.process = processManager.getChilds().firstOrDefault(x => x.name == process_name);

                if (!this.process) {
                    if (in_docker) {
                        // We are in docker.
                        let redis_info = null;// await redis_factory.getRedisInfo('redis', this.info.port);
                        if (!redis_info) {
                            redis_info = await redis_factory.getRedisInfo('localhost', this.info.port);
                            if (!redis_info) {
                                this.process = await this
                                    .startWithRedisServer(processManager, process_name, this.info.port, this.info.dataPath);
                            }
                            this.info.host = utils.ipAddress();
                        }
                        else {
                            /// We are in a docker environment
                            /// where redis is exposed as a service.
                            this.info.host = 'redis';
                        }
                    }
                    else {
                        this.process = await this.startWithDocker(processManager, process_name, this.info.port,
                            this.info.dataPath);

                    }
                }
                this.status = 'start';
                this.logger.info(
                    `redis service successfully provisioned. Info:${this.getInformation()}`
                )
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
            definition: {
                category: "redis" as ServiceCategories,
                parameters: this.info
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
        for (let idx = 0; idx < this._instances.length; idx++) {
            const _service = this._instances[idx];
            const matches = matchService(_service.getInformation().definition, definition);
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
        if (!request || !request.schema || request.schema === '') {
            throw utils.toException('invalid request.')
        }

        // let service: RedisMeshService = null;
        var service = this.GetOrCreate({
            category: 'redis',
            parameters: {
                schema: request.schema,
                server_name: request.server_name
            }
        })
        if (!service) {
            throw utils.toException("Unexpcted Error: Failed to add the required redis-service'");
        }
        await service.run(new MeshServiceContext(ctx.serviceProvider, null, service, null))
        var options: RedisClientOptions = {
            host: service.info.host,
            port: service.info.port,
            keyPrefix: service.info.schema + ':',
            password: 'tomcat_p@ssw0rd'

        };
        return options;


    }

}
