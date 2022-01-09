import utils from "../common/Domain.Utils";
import { queryRedisOptions, redisServiceDefinition } from "../contracts";
import { Contracts } from "../infrastructure";

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
        var bus = this.context.ServiceProvider.getBus();
        try {
            var result = bus.createMessage(Contracts.requireService(definition)).execute(undefined, 2 * 60 * 1000);
            (result);
            await utils.delay(5000);
            return null;
        }
        catch (err) {

        }
        return null;
    }

    async requireRedis(): Promise<ServiceDefinition> {
        return this.require(new redisServiceDefinition({}));
    }

    /**
     * Retruns a redis store that can be used 
     * to persists data for this mesh service.
     */

    async getRedisStore(name: string, type: 'exclusive' | 'shared' = 'shared'): Promise<IStore> {
        const ggg = await this.requireRedis();
        (ggg);
        let result: IStore = null;
        const bus = this.context.ServiceProvider.getBus();
        (bus);
        var response = await bus.createMessage(queryRedisOptions({ name: name, repository_type: type }))
            .execute(undefined, 20 * 1000, true);
        if (response) {
            const options = response.cast<RedisClientOptions>();
            result = this.context.ServiceProvider.getStoreFactory()
                .createStore({ 'provider': 'redis', redis: options });
        }
        return result;
    }

}