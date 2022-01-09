
// import { Exception } from "../../infrastructure/base";

import { ChildProcessWithoutNullStreams } from "child_process";

import utils from "../../common/Domain.Utils";
import { ILogger } from "../../infrastructure/base";
import { RedisUtils } from "../../infrastructure/services";
import { IProcess, IProcessManager } from "../../infrastructure/services/processManager/IProcessManager";


export interface RedisStartUpInfo {
    port?: number;
    containerName?: string
}
export type RedisInstanceInfo = {
    dataDirectory?: string,
    port?: number,
    containerID?: string,
    containerName?: string
}
export class RedisProcessAdapter {
    public logger: ILogger
    public process: ChildProcessWithoutNullStreams
    public iprocess: IProcess;
    public containerInfo: RedisInstanceInfo = {}
    public validated: boolean
    constructor(public info?: RedisStartUpInfo, private processManager?: IProcessManager) {
        this.logger = utils.getLogger("RedisProcessAdapter")
        this.info = info || {}
    }

    async startWithDocker(info?: RedisStartUpInfo): Promise<RedisInstanceInfo> {
        const dir = await utils.getRedisDataDirectory(this.info.containerName)
        this.containerInfo.dataDirectory = dir;
        this.iprocess = this.processManager.create('redis')
            .spawn("docker", ["run", "-d", "-p", `${info.port}:6379`, "-v", `${dir}:/data`, "--name", this.info.containerName, "redis"]);
        return this.containerInfo;


        // return new Promise((resolve, reject) => {
        //     utils.getRedisDataDirectory(this.info.containerName).then((name) => {
        //         this.containerInfo.dataDirectory = name
        //         this.logger.debug(`trying to start docker container ${info.containerName} on port ${info.port} data directory:${this.containerInfo.dataDirectory}`);
        //         this.iprocess = this.processManager.create('redis')
        //             .spawn("docker", ["run", "-d", "-p", `${info.port}:6379`, "-v", `${this.containerInfo.dataDirectory}:/data`, "--name", this.info.containerName, "redis"]);
        //         this.process = spawn("docker", ["run", "-d", "-p", `${info.port}:6379`, "-v", `${this.containerInfo.dataDirectory}:/data`, "--name", this.info.containerName, "redis"]);
        //         this.process.stdout.on('data', (data) => {
        //             this.containerInfo = { containerID: (data.toString() as string).split("\n")[0], dataDirectory: this.containerInfo.dataDirectory, port: this.info.port, containerName: this.info.containerName };
        //             this.logger.info(`successfuly started dcoker container ${this.containerInfo.containerName}`);
        //             resolve(this.containerInfo);
        //         });
        //         this.process.stderr.on('data', (err) => {
        //             this.logger.error(`was unable to start container ${this.containerInfo.containerName} err :${err}`);
        //             reject(err.toString());
        //         });
        //     })
        // });
    }
    async startWithRedisServer(info: RedisStartUpInfo): Promise<RedisInstanceInfo> {
        var redis_server = await RedisUtils.InstallRedis();
        var dir = await utils.getRedisDataDirectory(this.info.containerName);
        this.containerInfo.port = info.port;
        this.containerInfo.dataDirectory = dir;
        (dir);
        this.iprocess = this.processManager.create('redis')
            .spawn(redis_server, ['--port', info.port.toString(), '--dir', dir])
        return this.containerInfo;

    }
    async start(info?: RedisStartUpInfo): Promise<RedisInstanceInfo> {
        let result: RedisInstanceInfo = null;
        this.info = info || this.info
        this.info.port = this.info.port || await utils.findPort(6350, 6378)
        this.info.containerName = this.info.containerName || `Redis-${this.info.port}`
        if (utils.isInDocker()) {
            // We are in a docker container.
            // We will try to install...
            result = await this.startWithRedisServer(info);

        }
        else {
            result = await this.startWithDocker(this.info);

        }
        return result;
    }
    async stop(): Promise<unknown> {
        return this;
    }
}