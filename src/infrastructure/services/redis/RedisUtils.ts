import { exec } from "node:child_process";
import fs from "node:fs";

export class RedisUtils {

    static async IsRedisServerInstalled(): Promise<boolean> {
        return fs.existsSync("/usr/local/bin/redis-server")

    }
    static async InstallRedis(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const script = `
            cd /tmp
            wget http://download.redis.io/redis-stable.tar.gz
            tar xvzf redis-stable.tar.gz
            cd redis-stable
            make 
            sudo make install
            cd /tmp
            rm redis-stable -r
            `
            exec(script, (err) => {
                if (err) {
                    reject(err)
                }
                resolve("/usr/local/bin/redis-server");
            });

        });

    }

}