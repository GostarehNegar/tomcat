
import { RedisClient } from "./RedisClient";
import { RedisClientOptions } from './RedisClientOptions';
export interface IRedisClientFactory {
    defaultClientOptions: RedisClientOptions;
    createClient(options: RedisClientOptions): RedisClient;
    /**
     * 
     * @param host 
     * @param port 
     */
    getRedisInfo(host: string, port: number, timeout?: number): Promise<string>;

}

