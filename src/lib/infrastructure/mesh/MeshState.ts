import * as contracts from '../contracts'

import { ServiceStatus } from './ServiceStatus'

import { matchService, ServiceDefinition } from '.'
export class MeshState {
    public runningNodes = new Map<string, contracts.NodeStatusPayload>()
    addNode(status: contracts.NodeStatusPayload, node: string) {
        status.timestamp = Date.now()
        this.runningNodes.set(node, status)
    }
    async queryServices(definition: ServiceDefinition): Promise<ServiceStatus[]> {
        await Promise.resolve()
        const res: ServiceStatus[] = []
        this.runningNodes.forEach((value) => {
            value.services?.forEach((x) => {
                if (matchService(definition, x)) {
                    res.push({ available: true })
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