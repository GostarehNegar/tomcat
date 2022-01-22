import fs from "node:fs";
import path from "node:path";
import { ServiceDefinition, ServiceDefinitionHelper } from ".";
import { baseUtils, ILogger, IServiceProvider } from "../base";

import { IProcess } from "../services/processManager/IProcessManager";

export interface MeshNodeProcessData {
    dir: string,
    repo: string,
    main: string,
    definition: ServiceDefinition

}
export class MeshNodeProcess {
    public definition: ServiceDefinitionHelper;
    public process: IProcess;
    private logger: ILogger;
    constructor(public serviceProvider: IServiceProvider, public data: MeshNodeProcessData) {
        this.definition = new ServiceDefinitionHelper(data.definition);
        this.logger = baseUtils.getLogger(baseUtils.getClassName(this));

    }
    public get name(): string {
        return this.definition.name;
    }
    public async spawn(config: any): Promise<void> {
        const description = this.data;
        (config);
        this.logger.info(`Spawning a new Node ${this.name}`);
        const dir = path.resolve(baseUtils.getHomeDirectory(), description.dir);
        if (!fs.existsSync(dir)) {
            const git_result = await baseUtils.execute(`git clone ${description.repo} ${dir}`);
            (git_result);
            if (!fs.existsSync(dir)) {
                throw baseUtils.toException("git failed");
            }
            baseUtils.execute("npm install", { cwd: dir });
            baseUtils.execute("npm run build", { cwd: dir });
        }
        if (!fs.existsSync(dir)) {
            throw baseUtils.toException("git failed");
        }
        const config_file = baseUtils.getTempFile('cfg');
        fs.writeFileSync(config_file, JSON.stringify(config));

        const process = await this.serviceProvider.getProcessManager()
            .create(this.name)
            .spawn("node", [description.main, config_file], { cwd: dir });
        (process);
        process.onExit(c => {
            console.log(c);
        });
        this.process = process;
    }


}
export interface IMeshNodeRegistry {

}
export interface IMeshNodeController {
}
class MeshNodeRegistryData {
    nodes: MeshNodeProcessData[];
}
export class MeshNodeRegistry {
    nodes: MeshNodeProcess[] = []
    constructor(public serviceProvide: IServiceProvider, public data: MeshNodeRegistryData) {
        this.nodes = data.nodes.map(x => new MeshNodeProcess(this.serviceProvide, x));
    }
    find(description: MeshNodeProcessData) {
        const helper = new MeshNodeProcess(this.serviceProvide, description);
        return this.nodes.find(x => x.name == helper.name);
    }
    add(description: MeshNodeProcessData): MeshNodeProcess {
        if (!this.find(description)) {
            this.data.nodes.push(description);
            this.nodes.push(new MeshNodeProcess(this.serviceProvide, description));
        }
        return this.find(description);;
    }
}
export class MeshNodeController implements IMeshNodeController {
    private registry: MeshNodeRegistry;
    private logger: ILogger = baseUtils.getLogger("MeshNodeController")
    constructor(public serviceProvider: IServiceProvider) {

    }
    private getRegistryFileName(): string {
        return path.resolve(baseUtils.getWorkingDirectory("node-registry"), "registry.json");
    }
    public async findByName(name: string): Promise<MeshNodeProcess> {
        const result = (await this.getRegistry()).nodes.find(x => x.name == name);
        return result;
    }
    private async getRegistry(refresh = false): Promise<MeshNodeRegistry> {
        const fileName = this.getRegistryFileName();
        if (!this.registry || refresh) {
            let data = new MeshNodeRegistryData();
            if (fs.existsSync(fileName)) {
                data = JSON.parse(fs.readFileSync(fileName).toString());
            }
            data.nodes = data.nodes || [];
            if (!Array.isArray(data.nodes)) {
                data.nodes = [];
            }
            this.registry = new MeshNodeRegistry(this.serviceProvider, data);
        }
        return this.registry;
    }
    private async saveRegistry(): Promise<void> {
        fs.writeFileSync(
            this.getRegistryFileName(),
            JSON.stringify((await this.getRegistry()).data))
    }
    public async register(description: MeshNodeProcessData | MeshNodeProcess): Promise<MeshNodeProcess> {
        if (description instanceof MeshNodeProcess) {
            description = description.data;
        }
        const registry = await this.getRegistry();
        let existing = registry.find(description);
        if (!existing) {
            existing = registry.add(description);
            await this.saveRegistry();
        }
        return existing;
    }
    public async spawn(description: MeshNodeProcessData | MeshNodeProcess): Promise<MeshNodeProcess> {
        const helper = (description instanceof MeshNodeProcess) ? description : new MeshNodeProcess(this.serviceProvider, description);
        description = helper.data;
        this.logger.info(`Spawning a new Node ${helper.name}`);
        const dir = path.resolve(baseUtils.getHomeDirectory(), description.dir);
        if (!fs.existsSync(dir)) {
            const git_result = await baseUtils.execute(`git clone ${description.repo} ${dir}`);
            (git_result);
            if (!fs.existsSync(dir)) {
                throw baseUtils.toException("git failed");
            }
            baseUtils.execute("npm install", { cwd: dir });
            baseUtils.execute("npm run build", { cwd: dir });
        }
        if (!fs.existsSync(dir)) {
            throw baseUtils.toException("git failed");
        }
        const process = await this.serviceProvider.getProcessManager()
            .create(helper.name)
            .spawn("node", [description.main], { cwd: dir });
        (process);
        process.onExit(c => {
            console.log(c);
        });
        helper.process = process;
        return helper;

    }

}

