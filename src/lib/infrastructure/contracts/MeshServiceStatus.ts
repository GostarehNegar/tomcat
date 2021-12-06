import { Contract } from "./Contract"

export type NodeStatusPayload = {
    alive: boolean,

}
export function ServiceMessagesContract(event: string) {
    return `$services/events/${event}`
}
export function NodeStatusEvent(nodeName: string, status: NodeStatusPayload): Contract<NodeStatusPayload> {
    return {
        topic: ServiceMessagesContract('status') + `${nodeName}`,
        payload: status
    }

}