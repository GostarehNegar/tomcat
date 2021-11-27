import redis from "redis";
import config from '../../config'
const redisConfig = config.data.redis;
export function createRedistClient() {
    return redis.createClient(redisConfig.url);
}
export function createPublicRedistClient() {
    return redis.createClient(config.data.redis.publicUrl);
}