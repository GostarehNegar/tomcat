
import { RedisClient } from "./RedisClient";
import { RedisClientOptions } from './RedisClientOptions';
export interface IRedisClientFactory {
    createClient(options: RedisClientOptions): RedisClient;
}

