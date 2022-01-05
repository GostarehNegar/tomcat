import fs from "node:fs";

export class RedisUtils {

    static async IsRedisServerInstalled(): Promise<boolean> {
        return fs.existsSync("/use/local/bin/redis-server")

    }

}
