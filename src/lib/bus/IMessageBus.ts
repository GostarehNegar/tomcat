import { IHandler } from "./IHandler";
import { IMessageBusSubscription } from "./IMessageBusSubscription";
import { IMessageContext } from "./IMessageContext";

import { Message } from ".";

/**
 * Represents messaging features.
 */

export interface IMessageBus {
    /**
     * Creates a message (context) with a specific body to be later
     * published.
     * @param topic Message topic e.g 'some-topic'. It can be perfixed
     * with the channel such as "some-destination://some-topic"
     * @param body Body/payload of the message, can be any json serializable object.
     * @param to Optionaly name of the destination endpoint.
     */
    createMessage(
        topic: string,
        body?: unknown | null,
        to?: string | null,
        channel?: string
    ): IMessageContext;
    /**
     *
     * @param topic
     * @param handler
     */
    subscribe(
        topic: string,
        handler: IHandler,
        channel?: string
    ): Promise<IMessageBusSubscription>;
    start(): Promise<unknown>;
    get endpoint(): string; stop(): Promise<unknown>;
    publish(m: Message): Promise<unknown>;
}
