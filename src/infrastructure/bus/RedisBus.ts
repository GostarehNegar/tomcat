import redis from 'redis'
import baseconfig from '../base/baseconfig';
import { createPublicRedistClient } from '../data';
(createPublicRedistClient);
export class RedisMessage {
    private _topic: string;
    private _content: unknown;
    constructor(topic: string, content: unknown) {
        this._topic = topic;
        this._content = content;
    }
    public get Topic() {
        return this._topic;
    }
    public text(): string {
        return this._content as string;
    }
    public content<T>(): T {
        return this._content as T;
    }
}
class MessagePack {
    public id: number;
    public topic: string;
    public content: unknown;
}
export class RedisBus {
    private _client: redis.RedisClient;
    private _publisher: redis.RedisClient;
    private _subscriber: redis.RedisClient;

    private createRedisClient() {
        return createPublicRedistClient() || redis.createClient(baseconfig.data.redis.publicUrl);
    }
    private subscriber() {
        return this.createRedisClient();
        this._subscriber = this._subscriber || this.createRedisClient();
        return this._subscriber;

    }
    private publisher() {
        this._publisher = this._publisher || this.createRedisClient();
        return this._publisher;
    }
    private client() {
        this._client = this._client || this.createRedisClient();
        return this._client;

    }
    public healthCheck() {
        this.client().set("babak", "mahmoudi");
        (this.client().connected)

    }
    public subscribe(topic: string, cb: (messag: RedisMessage) => void) {
        const subscriber = this.subscriber();
        subscriber.psubscribe(topic, (_err, _count) => {
            (_count)
            if (_err) {
                throw _err
            }
            subscriber.on('pmessage', (_patter, _channel, _content) => {
                const o = JSON.parse(_content) as MessagePack;
                const message = new RedisMessage(o.topic, o.content);
                if (cb) {
                    cb(message);
                }
            });
        });

    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public publish(topic: string, content: any): void {
        const pack = new MessagePack();
        pack.id = Date.now();
        pack.topic = topic;
        pack.content = content;
        this.publisher().publish(topic, JSON.stringify(pack));
    }

    public static Bus = null;

}