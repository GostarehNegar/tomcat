import { ServiceDefinition, ServiceInformation } from "../mesh/ServiceDefinition"

import { Contract } from "./Contract"

export type NodeStatusPayload = {
    alive: boolean,
    services: ServiceInformation[],
    /**
     * When the node has last seen in ticks.
     * This is updated whenever a new status 
     * is recieved by the MeshServer
     */
    last_seen?: number

}
export type queryServicePayload = {
    serviceDefinition: ServiceDefinition
}
export type queryServiceCapabilityReply = {
    load: number
    acceptable: boolean
    endpoint?: string
}
export type serviceOrderPayload = {
    serviceDefinition: ServiceDefinition
}
export type serviceOrderReply = {
    started: number
}
export function ServiceMessagesContract(event: string) {
    return `$services/events/${event}`
}
export function ServiceCommandContract(command: string) {
    return `$services/commands/${command}`
}
export function NodeStatusEvent(nodeName: string, status: NodeStatusPayload): Contract<NodeStatusPayload> {
    return {
        topic: ServiceMessagesContract('status') + `/${nodeName}`,
        payload: status
    }

}
export function queryServiceCapability(serviceDefinition: ServiceDefinition): Contract<queryServicePayload> {
    return {
        topic: ServiceCommandContract("queryservicecap"),
        payload: { serviceDefinition: serviceDefinition }
    }
}
export function serviceOrder(serviceDefinition: ServiceDefinition): Contract<serviceOrderPayload> {
    return {
        topic: ServiceCommandContract("executeservice"),
        payload: { serviceDefinition: serviceDefinition }
    }
}
export function requireService(serviceDefinition: ServiceDefinition): Contract<ServiceDefinition> {
    return {
        topic: ServiceCommandContract("requireservice"),
        payload: serviceDefinition
    }
}
export type ServiceRegistrationPayload = {
    dir: string,
    repo: string,
    definition: ServiceDefinition

}
export function registerService(serviceDefinition: ServiceRegistrationPayload): Contract<ServiceRegistrationPayload> {
    return {
        topic: ServiceCommandContract("register"),
        payload: serviceDefinition
    }
}



