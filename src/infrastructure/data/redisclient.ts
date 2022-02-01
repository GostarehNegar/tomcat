import redis from "redis";

import config from '../base/baseconfig'
const dataConfig = config.data
export function createRedistClient() {
    console.log(dataConfig.redisOptions);
    if (dataConfig.redisOptions) {
        return redis.createClient(dataConfig.redisOptions)

    } else {
        return redis.createClient({ url: dataConfig.redis.url })
    }
}
export function createPublicRedistClient() {
    return redis.createClient(config.data.redis.publicUrl);
}