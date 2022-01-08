
import { RedisClient } from "./RedisClient";
import { RedisClientOptions } from './RedisClientOptions';
/**
 * Provides functionalitied to create redis clients.
 */
export interface IRedisClientFactory {
    defaultClientOptions: RedisClientOptions;
    /**
     * Creates a redis client using the supplied options.
     * @param options 
     */
    createClient(options: RedisClientOptions): RedisClient;
    /**
     * Gets information of a redist server on a host with the
     * specified port.
     * Returns null, if there is no such a server.
     * 
     * @param host 
     * @param port 
     */
    getRedisInfo(host: string, port: number, timeout?: number): Promise<string>;

}

