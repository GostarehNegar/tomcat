import { CancellationTokenSource, IServiceProvider } from "../base";
import { IMessageBus } from "../bus";
import { requireService } from "../contracts";

import { IMeshNode } from "./IMeshNode";

import { IMeshService, IMeshServiceContext, ServiceDefinition, ServiceInformation } from ".";
import { MeshServiceHelper } from "../../services";



export class MeshServiceContext implements IMeshServiceContext {


    constructor(public ServiceProvider: IServiceProvider, public node: IMeshNode,
        public service: IMeshService, public cancellationToken: CancellationTokenSource) {

    }
    shouldStop(wait = 1): Promise<boolean> {
        return new Promise((resolve) => {
            //setImmediate(() => resolve(this.cancellationToken.isCancelled))
            setTimeout(() => resolve(this.cancellationToken.isCancelled), wait);
        })
        throw new Error("Method not implemented.");
    }
    getHelper(): MeshServiceHelper {
        throw new Error("Method not implemented.");
    }
    private getBus(): IMessageBus {
        return this.ServiceProvider.getBus();
    }
    async require(definition: ServiceDefinition, timeOut = 10000): Promise<ServiceInformation> {
        const result = await this.getBus().createMessage(requireService(definition))
            .execute(undefined, timeOut, true);
        return result.cast<ServiceInformation>();
    }

}
