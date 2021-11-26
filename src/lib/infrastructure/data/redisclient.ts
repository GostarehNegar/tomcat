import redis from "redis";

export const redisConfig={
    /**
     * The url to redis server.
     * null: localhost.
     * 'redis://redis:6379': connect to redis in this container.
     */
    url:null,
    publicUrl:null,
}
export function createRedistClient(){
    return redis.createClient(redisConfig.url);
}
export function createPublicRedistClient(){
    return redis.createClient(redisConfig.publicUrl);
}