import { IMeshService } from ".";
import { CancellationToken, IServiceProvider } from "../base";

import { IMeshNode } from "./IMeshNode";

/**
 * provides context for a runnig mesh service.
 */
export interface IMeshServiceContext {
    ServiceProvider: IServiceProvider;
    service: IMeshService
    node: IMeshNode,
    /**
     * the stop token. Service 'run' method
     * should continue until this token is cancelled.
     */
    cancellationToken: CancellationToken;
    /**
     * designed to be used in service run method to
     * wait for stop. Typically in a 'while(! await ctx.shouldStop()){}'
     * loop. Note that a service run method should keep running
     * until a stop request is recieved.
     * @param wait 
     */
    shouldStop(wait?: number): Promise<boolean>;




}
