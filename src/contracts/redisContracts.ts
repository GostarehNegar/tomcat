
import { Contract } from "../infrastructure/contracts/Contract"
import { ServiceCategories, ServiceDefinitionBase } from "../infrastructure/mesh/ServiceDefinition"
import { ServiceCommandContract } from "./dataContracts"

/**
 * Parameters that define a redis service.
 * Redis services will provided either in two modes:
 *   -Shared: where clients share the same instance, each client
 *            will have a schema-perfix that wil be used to provide
 *            a schema-vise privacy.
 *   -Exclusive: A new instance of redis will be provisioned for the
 *              client. This is often a new instance of redis on a new
 *              port.
 */
export interface IRedisServiceParameters {
    [key: string]: unknown
    /**
     * A schema name that will be used as a perfix
     * to distinguish different clients on a shared
     * redis.
     */
    "schema": string
    /**
     * When set an exclusive redis server that is 
     * identified with this name will be provided.
     */
    "server_name"?: string
}
/**
 * Parameters that define a redis service.
 * It specially inducates that the service should 
 * be exclusive in the sense that it is exclusively
 * used by the requesting service. 
 * It also inculdes a 'schema' name that may be used
 * to perfix entries of a service to avoid conflicts
 * when using a shared redis.
 */
export interface IRedisServiceInformationParameters {
    [key: string]: unknown
    "port"?: number
    "dataPath"?: string
    "host"?: string
    /**
     * A suggested schema that will be used to perfix
     * redis entries to avoid conflicts.
     */
    "schema": string
    /**
     * When specified an exlusive server identified
     * with this name will be provisioned.
     */
    "server_name"?: string
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
    //repository_type?: 'shared' | 'exclusive';
    "server_name"?: string;
    "schema": string;
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



