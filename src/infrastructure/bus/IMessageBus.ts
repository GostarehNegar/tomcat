import { IHandler } from "./IHandler";
import { IMessageBusSubscription } from "./IMessageBusSubscription";
import { IMessageContext } from "./IMessageContext";
import { IMessageContract } from "./IMessageContract";

/**
 * Represents messaging features.
 */

export interface IMessageBus {
    /**
     * Creates a message (context) with a specific body to be later
     * published.
     * @param topic Message topic e.g 'some-topic'. 
     * @param body Body/payload of the message, can be any json serializable object.
     * @param to Optionaly name of the destination endpoint.
     */
    createMessage(
        topic: string | IMessageContract,
        body?: unknown | null,
        to?: string | null,
    ): IMessageContext;
    /**
     * Subscribe to a topic by providing a handler. WildCards
     * can be used.
     * @param topic The topic to subscribe to. (Wildcards are accepted.)
     * @param handler The call back handler.
     */
    subscribe(
        topic: string,
        handler: IHandler,
    ): Promise<IMessageBusSubscription>;
    start(): Promise<unknown>;
    get endpoint(): string;
    stop(): Promise<unknown>;
    // /**
    //  * Publishes the message.
    //  * @param message 
    //  */
    // publish(message: Message): Promise<unknown>;
}
