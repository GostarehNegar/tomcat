import * as contracts from '../contracts'


import { matchService, ServiceDefinition, ServiceInformation } from '.'
export class MeshState {
    public runningNodes = new Map<string, contracts.NodeStatusPayload>()
    addNode(status: contracts.NodeStatusPayload, node: string) {
        status.timestamp = Date.now()
        this.runningNodes.set(node, status)
    }
    async queryServices(definition: ServiceDefinition): Promise<ServiceInformation[]> {
        await Promise.resolve()
        const res: ServiceInformation[] = []
        this.runningNodes.forEach((value) => {
            value.services?.forEach((x) => {
                if (matchService(definition, x)) {
                    res.push(x)
                }
            })
        })
        return res
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