

import { IServiceProvider } from "../base";

import { IMeshNodeController, MeshNodeController, ServiceDefinition, } from '../mesh';


export interface INodeManagerService extends IMeshNodeController {
    // startNode(node: INode): Promise<Process>
    // startNodeByName(name: string): Promise<Process>
    startNodeByServiceDefinition(def: ServiceDefinition): Promise<any>

}

export class NodeManagerService extends MeshNodeController implements INodeManagerService {
    constructor(serviceProvider: IServiceProvider) {
        super(serviceProvider);
    }
    async startNodeByServiceDefinition(def: ServiceDefinition): Promise<any> {
        var node = await this.findByDef(def);
        if (node != null) {
            await node.spawn(def);
        }
        return node;
    }
}
