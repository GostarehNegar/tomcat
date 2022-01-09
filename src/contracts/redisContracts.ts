
import { Contract } from "../infrastructure/contracts/Contract"
import { ServiceCategories, ServiceDefinitionBase } from "../infrastructure/mesh/ServiceDefinition"
import { ServiceCommandContract } from "./dataContracts"

export interface IRedisServiceParameters {
    [key: string]: unknown
    'type'?: 'exlusive' | 'shared'
    "port"?: string
    "dataPath"?: string
    "name"?: string
}
export class redisServiceDefinition extends ServiceDefinitionBase<IRedisServiceParameters> {
    readonly category: ServiceCategories = "redis"
    constructor(params: IRedisServiceParameters) {
        super()
        this.parameters = params
    }
}
export type orderRedisServicePayload = {
    containerId: string
    dataDrirectory?: string,
    portNumber?: string,
}
/**
 * Contract to query for a redis repo based on the
 * specified type. Handlers will reply with a sort of
 * 'ClientOptions' that can be passed to redis client
 * factory to create an actual 'redis client'.
 * Handlers will decide (based on the type), how to setup
 * an appropriate connection for this client.
 * 
 */
export type queryRedisOptionsPayload = {
    name: string;
    repository_type: 'shared' | 'exclusive';
}

export function orderRedisService(payload: orderRedisServicePayload): Contract<orderRedisServicePayload> {
    return {
        topic: ServiceCommandContract("orderredisservice"),
        payload: payload
    }
}

/**
 * Creates a request contract which will be replied by
 * 'clientoptions' that can be used to stablish a redis 
 * connection thru redis client factory.
 * @param payload 
 * @returns 
 */
export function queryRedisOptions(payload: queryRedisOptionsPayload): Contract<queryRedisOptionsPayload> {
    return {
        topic: ServiceCommandContract("queryredisoptions"),
        payload: payload
    }
}



