import { IServiceProvider } from "../base";
import { IMessageBus } from "../bus";
import { requireService } from "../contracts";

import { IMeshNode } from "./IMeshNode";

import { IMeshService, IMeshServiceContext, ServiceDefinition, ServiceInformation } from ".";



export class MeshServiceContext implements IMeshServiceContext {


    constructor(public ServiceProvider: IServiceProvider, public node: IMeshNode, public service: IMeshService) {

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
