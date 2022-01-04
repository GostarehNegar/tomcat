import { baseUtils } from '../base'
import * as contracts from '../contracts'

import { matchService, ServiceDefinition, ServiceInformation } from '.'
export class MeshState {
    public runningNodes = new Map<string, contracts.NodeStatusPayload>()
    public logger = baseUtils.getLogger("MeshState")
    addNode(status: contracts.NodeStatusPayload, node: string) {
        status.last_seen = Date.now()
        status.alive = true;
        if (!this.runningNodes.has(node)) {
            this.logger.info(`a new node was detected, name: ${node}`)
        }
        this.runningNodes.set(node, status)
    }
    async queryServices(definition: ServiceDefinition): Promise<ServiceInformation[]> {
        await Promise.resolve()
        const res: ServiceInformation[] = []
        this.runningNodes.forEach((value) => {
            value.services?.forEach((x) => {
                if (matchService(x, definition)) {
                    res.push(x)
                }
            })
        })
        return res
    }
    disposeNode() {
        //implement
    }
    // match(a: ServiceDefinition, b: ServiceDefinition) {

    //     if (a.category == b.category) {
    //         let result = true
    //         for (const key in b.parameters) {
    //             result = result && a.parameters[key] == b.parameters[key]
    //         }
    //         return result
    //     }
    //     return false
    // }
}