import { baseUtils } from '../base'
import * as contracts from '../contracts'

import { matchService, ServiceDefinition, ServiceInformation } from '.'
import baseconfig from '../base/baseconfig'
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
                if (matchService(x.definition, definition)) {
                    res.push(x)
                }
            })
        })
        return res
    }
    disposeNode() {
        const inactive_nodes = [];
        let heartBeat = (baseconfig.mesh.heartBeatInSeconds || 5) * 5;
        if (!Number.isFinite(heartBeat))
            heartBeat = 5 * 5;
        this.runningNodes.forEach((x, k) => {
            if (Date.now() - x.last_seen > heartBeat * 1000) {
                x.alive = false;
                inactive_nodes.push(k);
                this.logger.info(
                    `Disposing a node because it's not seen recently name: ${k}, heartBeat:${heartBeat}`)
            }
        });
        inactive_nodes.forEach(k => {

            this.runningNodes.delete(k);
        });
    }
}