import { IServiceProvider } from "../base";
import { IMeshService, IMeshServiceContext, ServiceDefinition, ServiceInformation } from ".";
import { IMeshNode } from "./IMeshNode";

import { IMessageBus } from "../bus";
import { requireService } from "../contracts";



export class MeshServiceContext implements IMeshServiceContext {


    constructor(public ServiceProvider: IServiceProvider, public node: IMeshNode, public service: IMeshService) {

    }
    private getBus(): IMessageBus {
        return this.ServiceProvider.getBus();
    }
    async require(definition: ServiceDefinition, timeOut: number = 10000): Promise<ServiceInformation> {
        var result = await this.getBus().createMessage(requireService(definition))
            .execute(undefined, timeOut, true);
        return result.cast<ServiceInformation>();




    }

}
