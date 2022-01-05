
// import { Exception } from "../../infrastructure/base";

import { ChildProcessWithoutNullStreams, spawn } from "child_process";

import utils from "../../common/Domain.Utils";
import { ILogger } from "../../infrastructure/base";

export interface RedisStartUpInfo {
    port?: number;
    containerName?: string
}
export type redisContainerInfo = {
    dataDirectory?: string,
    port?: number,
    containerID?: string,
    containerName?: string
}
export class RedisProcessAdapter {
    public logger: ILogger
    public process: ChildProcessWithoutNullStreams
    public containerInfo: redisContainerInfo = {}
    public validated: boolean
    constructor(public info?: RedisStartUpInfo) {
        this.logger = utils.getLogger("RedisProcessAdapter")
        this.info = info || {}
    }
    async start(info?: RedisStartUpInfo): Promise<redisContainerInfo> {
        this.info = info || this.info
        this.info.port = this.info.port || await utils.findPort(6350, 6378)
        this.info.containerName = this.info.containerName || `Redis-${this.info.port}`
        return new Promise((resolve, reject) => {
            utils.getRedisDataDirectory(this.info.containerName).then((name) => {
                this.containerInfo.dataDirectory = name
                this.logger.debug(`trying to start docker container ${this.info.containerName} on port ${this.info.port} data directory:${this.containerInfo.dataDirectory}`);
                this.process = spawn("docker", ["run", "-d", "-p", `${this.info.port}:6379`, "-v", `${this.containerInfo.dataDirectory}:/data`, "--name", this.info.containerName, "redis"]);
                this.process.stdout.on('data', (data) => {
                    this.containerInfo = { containerID: (data.toString() as string).split("\n")[0], dataDirectory: this.containerInfo.dataDirectory, port: this.info.port, containerName: this.info.containerName };
                    this.logger.info(`successfuly started dcoker container ${this.containerInfo.containerName}`);
                    resolve(this.containerInfo);
                });
                this.process.stderr.on('data', (err) => {
                    this.logger.error(`was unable to start container ${this.containerInfo.containerName} err :${err}`);
                    reject(err.toString());
                });
            })
        });
    }
    async stop(): Promise<unknown> {
        return this;
    }
}