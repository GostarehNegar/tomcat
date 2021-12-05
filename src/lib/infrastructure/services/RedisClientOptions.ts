//import redis from 'redis';

// export interface RedisClientOptions extends redis.ClientOpts {
//     usePublic?: boolean;
// }
import IORedis from "ioredis";
export interface RedisClientOptions extends IORedis.RedisOptions {
    usePublic?: boolean;
}

