
import { Exception } from "../../infrastructure/base";

export interface RedisStartUpInfo {
    port: number | string;

}
export class RedisProcessAdapter {

    constructor(public info: RedisStartUpInfo) {

    }
    async start(): Promise<unknown> {

        throw new Exception("Not Implemented", 'unkown');
        return this;

    }
    async stop(): Promise<unknown> {
        return this;
    }
}