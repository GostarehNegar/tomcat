import { ChildProcessWithoutNullStreams, exec, spawn } from 'child_process';

import { Contracts } from '../domain';
import { baseUtils, ILogger } from '../infrastructure/base';
// import { BaseConstants } from '../infrastructure/base/baseconstants';
import { HostBuilder } from '../infrastructure/hosting';
import { IMeshService, ServiceCategories, ServiceDefinition, ServiceInformation, ServiceStatus } from '../infrastructure/mesh';
import "../extensions"
// tomcat.Infrastructure.Base.Logger.level = 'debug'


export type redisInfo = {
    dataDrirectory: string,
    portNumber: string,
    containerID: string,
}

export class RedisService implements IMeshService {
    public process: ChildProcessWithoutNullStreams;
    public containerName: string;
    public portNumber: string;
    public dataDirectory: string;
    public containerId: string;
    public isReady: boolean
    public status: ServiceStatus = 'start'
    public Id: string = baseUtils.UUID()
    public logger: ILogger
    constructor(public def: ServiceDefinition) {
        this.logger = baseUtils.getLogger("RedisService")
        this.containerName = (this.def.parameters && this.def.parameters["name"]) as string || baseUtils.randomName("redis")
        this.portNumber = this.def.parameters && this.def["port"] as string
        this.dataDirectory = (this.def.parameters && this.def["dataPath"]) || `/home/paria/Desktop/a/${this.containerName}`
    }
    getInformation(): ServiceInformation {
        return { category: "redis" as ServiceCategories, parameters: { port: this.portNumber, dataDir: this.dataDirectory, containerID: this.containerId, redisName: this.containerName, connectionString: `redis://localhost:${this.portNumber}` }, status: this.status }
    }
    async start(): Promise<unknown> {

        try {
            await this.createDir(this.dataDirectory);
        } catch (err) {
            if (!err.message.includes('exist')) {
                throw err
            }
        }
        this.portNumber = this.portNumber || (await baseUtils.findPort(6300, 6378)).toString()
        return new Promise((resolve, reject) => {
            this.logger.debug(`trying to start docker container ${this.containerName} on port ${this.portNumber} data directory:${this.dataDirectory}`)
            this.process = spawn("docker", ["run", "-d", "-p", `${this.portNumber}:6379`, "-v", `${this.dataDirectory}:/data`, "--name", this.containerName, "redis"])
            this.process.stdout.on('data', (data) => {
                this.containerId = (data.toString() as string).split("\n")[0]
                const result: redisInfo = { containerID: this.containerId, dataDrirectory: this.dataDirectory, portNumber: this.portNumber }
                this.isReady = true
                this.logger.info(`successfuly started dcoker container ${this.containerName}`)
                resolve(result)
            });
            this.process.stderr.on('data', (err) => {
                this.logger.error(`was unable to start container ${this.containerName} err :${err}`)
                reject(err.toString())
            });
        })
    }
    createDir(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(`mkdir ${path}`, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve("done")
                }
            })
        })
    }
}

(async () => {
    const client1 = new HostBuilder('redisservice', null)
        .addMessageBus(cfg => {
            cfg.endpoint = "redisservice";
            cfg.transports.websocket.url = "http://localhost:8084/hub";
        })
        .addMeshService({ category: 'redis', parameters: {} }, (def) => new RedisService(def))
        .build();
    client1.bus.subscribe(Contracts.queryRedisContainer(null).topic, async (ctx) => {
        // const meshNode = client1.services.getService<MeshNode>(BaseConstants.ServiceNames.MeshNode)
        // const payload = ctx.message.cast<Contracts.queryRedisContainerPayload>()
        await ctx.reply({ host: "localhost", port: 6379, db: "2" })
        // const service = (meshNode.runningServices as RedisService[]).find(x => x.containerName == payload.containerName)
        // if (service && service.isReady) {
        //     meshNode.logger.info(`container ${service.containerName} was found`)
        //     await ctx.reply({ connectionString: `redis://localhost:${service.portNumber}` })
        // } else {
        //     meshNode.logger.warn(`no container by the name of ${payload.containerName} was found or service is not ready . ready :${service?.isReady}`)
        //     await ctx.reply(null)
        // }
    })

    await client1.start()
    await baseUtils.delay(15000);
})()