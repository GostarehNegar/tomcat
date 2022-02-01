import fs from "node:fs";
import path from "node:path";

import { baseUtils, ILogger, IServiceProvider } from "../base";
import { IProcess } from "../services/processManager/IProcessManager";

import { ServiceDefinition } from ".";


export interface MeshNodeProcessData {
    dir: string;
    repo: string;
    main: string;
    definition: ServiceDefinition;

}
export class MeshNodeProcess {
    public definition: ServiceDefinition;
    public process: IProcess;
    public lastError: any;
    private logger: ILogger;
    constructor(public serviceProvider: IServiceProvider, public data: MeshNodeProcessData) {
        this.definition = baseUtils.extend(new ServiceDefinition(), data.definition);
        this.logger = baseUtils.getLogger(baseUtils.getClassName(this));

    }
    public get name(): string {
        return this.definition.getName();
    }
    public async spawn(config: any): Promise<void> {
        const description = this.data;
        (config);
        this.logger.info(`Spawning a new Node ${this.name}`);
        const dir = path.resolve(baseUtils.getHomeDirectory(), description.dir);
        this.lastError = null;
        try {
            if (!fs.existsSync(dir)) {
                this.logger.info(
                    `Directory '${dir}' does not exists. We will git clone repo '${description.repo} to this directory...'`);
                const git_result = await baseUtils.execute(`git clone ${description.repo} ${dir}`);
                (git_result);
                if (!fs.existsSync(dir)) {
                    throw baseUtils.toException("git failed");
                }
                this.logger.info(`Repository successfully cloned to ${dir}. Now we will run 'npm install'.`);
                try {
                    await baseUtils.execute("npm install", { cwd: dir });
                }
                catch (err) {
                    this.logger.warn(
                        `An error occured while invoking 'npm install'. We will ignore this error. Error:'${err}'`);

                }
                this.logger.info(`Node modules successfully installed using 'npm install'. Invoking 'npm build'.`);
                try {
                    await baseUtils.execute("npm run build", { cwd: dir });
                }
                catch (err) {
                    this.logger.warn(
                        `An error occured while invoking 'npm run build'. We will ignore this error. Error:'${err}'`);
                }
            }
            if (!fs.existsSync(dir)) {
                throw baseUtils.toException("git failed");
            }
            if (!fs.existsSync(description.main)) {
                throw baseUtils.toException(
                    `Not found. Service source '${description.main}' not found at '${dir}. '` +
                    `Probably the build pase has failed.`);
            }
            const config_file = baseUtils.getTempFile('config.cfg');
            config.infrastructure = config.infrastructure || {};
            config.infrastructure.start_args = {};
            //config = Object.assign(this.serviceProvider.getService(BaseConstants.ServiceNames.Config), config);
            config.infrastructure.start_args.service_definition = description.definition;
            fs.writeFileSync(config_file, JSON.stringify(config));
            this.process = await this.serviceProvider.getProcessManager()
                .create(this.name)
                .spawn("node", [description.main, config_file], { cwd: dir });
        }
        catch (err) {
            this.logger.error(
                `An error occured while trying to spawn this node:'${err}'`);
            this.lastError = err;
        }
    }


}
