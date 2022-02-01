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
    stop(): boolean;



}
