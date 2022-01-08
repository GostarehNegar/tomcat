import utils from "../common/Domain.Utils";
import { queryRedisOptions, redisServiceDefinition } from "../contracts";

import { IStore } from "../infrastructure/data";
import { IMeshServiceContext, ServiceDefinition, ServiceInformation } from "../infrastructure/mesh";
import { RedisClientOptions } from "../infrastructure/services";
export class MeshServiceHelper {

    constructor(public context: IMeshServiceContext) {

    }

    /**
     * Requires a service defined with the supplied
     * service definition.
     * @param definition 
     */
    async require(definition: ServiceDefinition): Promise<ServiceInformation> {
        (definition)
        throw utils.toException("Not Implemented");
        return null;
    }

    async requireRedis(): Promise<ServiceDefinition> {
        return this.require(new redisServiceDefinition({}));
    }

    /**
     * Retruns a redis store that can be used 
     * to persists data for this mesh service.
     */

    async getRedisStore(type: 'exclusive' | 'shared' = 'shared'): Promise<IStore> {
        await this.requireRedis();
        let result: IStore = null;
        const bus = this.context.ServiceProvider.getBus();
        (bus);
        var response = await bus.createMessage(queryRedisOptions({ repository_type: type }))
            .execute();
        if (response) {
            const options = response.cast<RedisClientOptions>();
            result = this.context.ServiceProvider.getStoreFactory()
                .createStore({ 'provider': 'redis', redis: options });
        }
        return result;
    }

}