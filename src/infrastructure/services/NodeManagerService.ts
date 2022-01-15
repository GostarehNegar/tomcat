import { ChildProcess, spawn } from 'child_process';
import fs from 'fs'
import path from 'path'


import { baseUtils, ILogger, IServiceProvider } from "../base";
import baseconfig from '../base/baseconfig';
import { matchService, ServiceDefinition } from '../mesh';

class Process {
    constructor(public childProcess: ChildProcess) {
        childProcess.on('exit', (code, signal) => {
            console.log(code, signal);

        })
    }
    // process.stdout.on("data", (data) => {
    //     console.log(data.toString());

    // });
    // process.stderr.on('data', (err) => {
    //     console.log(err.toString());

    // })
}

export interface INode {
    jsFileName?: string
    script?: string
    name: string
    serviceDefinition?: ServiceDefinition
    cwd?: string
}
export interface INodeManagerService {
    startNode(node: INode): Promise<Process>
    startNodeByName(name: string): Promise<Process>
    startNodeByServiceDefinition(def: ServiceDefinition): Promise<Process>
}
export class NodeManagerService implements INodeManagerService {
    public logger: ILogger
    public processes: Process[] = []
    public nodes: INode[] = []
    constructor(public serviceProvider: IServiceProvider) {
        this.logger = baseUtils.getLogger("NodeManagerService")
        this.nodes.push({ name: "data", jsFileName: "dataService.js", cwd: "./build/main/services", serviceDefinition: { category: 'data', parameters: {} } })
        // this.nodes.push({ name: "dataScript", cwd: "../tomcat-bot-hosting", script: "run-dataservice" })
        this.nodes.push({ name: "redis", cwd: "./build/main/", jsFileName: "RedisServer.js", serviceDefinition: { category: 'redis', parameters: {} } })
    }
    async startNodeByName(name: string) {
        const node = this.nodes.find(x => x.name == name)
        if (node) {
            return await this.startNode(node)
        } else {
            throw "node was not found"
        }
    }
    async startNodeByServiceDefinition(def: ServiceDefinition) {
        const node = this.nodes.find(x => matchService(def, x.serviceDefinition))
        if (node) {
            return await this.startNode(node)
        } else {
            throw "node was not found"
        }
    }
    async startNode(node: INode): Promise<Process> {
        if (!fs.existsSync(node.cwd)) {
            throw "could not find provided working directory"
        }
        let myProcess: ChildProcess;
        const configPath = path.resolve(node.cwd, "config.json")
        fs.writeFileSync(configPath, JSON.stringify(baseconfig))
        if (node.script) {
            this.logger.info(`spinning up a new node script : ${node.script}`)
            myProcess = spawn("npm", ["run", node.script], { cwd: node.cwd })

        } else {
            const nodePath = path.resolve(node.cwd, node.jsFileName)
            this.logger.info(`executing a new node , ${nodePath}`)
            myProcess = spawn("node", [nodePath], { cwd: node.cwd });
        }
        const process = new Process(myProcess)
        this.processes.push(process)
        return process
    }

}