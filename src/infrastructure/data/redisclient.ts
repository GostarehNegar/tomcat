import redis from "redis";

import config from '../base/baseconfig'
const dataConfig = config.data
export function createRedistClient() {
    console.log(dataConfig.redisEx);
    if (dataConfig.redisEx) {
        return redis.createClient(dataConfig.redisEx)

    } else {
        return redis.createClient({ url: dataConfig.redis.url })
    }
}
export function createPublicRedistClient() {
    return redis.createClient(config.data.redis.publicUrl);
}