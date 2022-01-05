import { ChildProcessWithoutNullStreams } from 'child_process';

import { baseUtils, ILogger } from '../../infrastructure/base';
import { IMeshService, IMeshServiceContext, ServiceCategories, ServiceDefinition, ServiceInformation, ServiceStatus } from '../../infrastructure/mesh';

export type redisInfo = {
    dataDrirectory: string,
    portNumber: string,
    containerID: string,
}

export class RedisMeshService implements IMeshService {
    public process: ChildProcessWithoutNullStreams;
    public containerName: string;
    public portNumber: string;
    public dataDirectory: string;
    public containerId: string;
    public isReady: boolean;
    public status: ServiceStatus = 'start';
    public Id: string = baseUtils.UUID();
    public logger: ILogger;
    constructor(public def: ServiceDefinition) {
        this.logger = baseUtils.getLogger("RedisService");
        this.containerName = (this.def.parameters && this.def.parameters["name"]) as string || baseUtils.randomName("redis");
        this.portNumber = this.def.parameters && this.def["port"] as string;
        this.dataDirectory = (this.def.parameters && this.def["dataPath"]) || `/home/paria/Desktop/a/${this.containerName}`;
    }
    start(ctx?: IMeshServiceContext): Promise<unknown> {
        (ctx)
        throw new Error('Method not implemented.');
    }
    getInformation(): ServiceInformation {
        return { category: "redis" as ServiceCategories, parameters: { port: this.portNumber, dataDir: this.dataDirectory, containerID: this.containerId, redisName: this.containerName, connectionString: `redis://localhost:${this.portNumber}` }, status: this.status };
    }
    // async start(ctx: IMeshServiceContext): Promise<unknown> {
    //     (ctx)
    //     try {
    //         await this.createDir(this.dataDirectory);
    //     } catch (err) {
    //         if (!err.message.includes('exist')) {
    //             throw err;
    //         }
    //     }
    //     this.portNumber = this.portNumber || (await baseUtils.findPort(6300, 6378)).toString();
    //     return new Promise((resolve, reject) => {
    //         this.logger.debug(`trying to start docker container ${this.containerName} on port ${this.portNumber} data directory:${this.dataDirectory}`);
    //         this.process = spawn("docker", ["run", "-d", "-p", `${this.portNumber}:6379`, "-v", `${this.dataDirectory}:/data`, "--name", this.containerName, "redis"]);
    //         this.process.stdout.on('data', (data) => {
    //             this.containerId = (data.toString() as string).split("\n")[0];
    //             const result: redisInfo = { containerID: this.containerId, dataDrirectory: this.dataDirectory, portNumber: this.portNumber };
    //             this.isReady = true;
    //             this.logger.info(`successfuly started dcoker container ${this.containerName}`);
    //             resolve(result);
    //         });
    //         this.process.stderr.on('data', (err) => {
    //             this.logger.error(`was unable to start container ${this.containerName} err :${err}`);
    //             reject(err.toString());
    //         });
    //     });
    // }
}
