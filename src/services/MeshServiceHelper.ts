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
        var res = await this.require(new redisServiceDefinition({ schema: "test", server_name: '' }));
        return res.definition;
    }

    /**
     * Retruns a redis store that can be used 
     * to persists data for this mesh service.
     */

    async getRedisStore(schema: string, server_name?: string): Promise<IStore> {
        const ggg = await this.requireRedis();
        (ggg);
        let result: IStore = null;
        const bus = this.context.ServiceProvider.getBus();
        (bus);
        var response = await bus.createMessage(queryRedisOptions({ schema: schema, server_name: server_name }))
            .execute(undefined, 20 * 1000, true);
        if (response) {
            const options = response.cast<RedisClientOptions>();
            result = this.context.ServiceProvider.getStoreFactory()
                .createStore({ 'provider': 'redis', redis: options });
        }
        return result;
    }

}