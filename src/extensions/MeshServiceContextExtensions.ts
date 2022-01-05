
import utils from "../common/Domain.Utils";
import { IMeshServiceContext, ServiceDefinition, ServiceInformation } from "../infrastructure/mesh";
import { MeshServiceContext } from "../infrastructure/mesh/MeshServiceContext";
import { MeshServiceHelper } from "../services/MeshServiceHelper";
const logger = utils.getLogger("MeshServiceContextExtensions");

export async function requireService(ctx: IMeshServiceContext, service: ServiceDefinition): Promise<ServiceInformation> {

    (ctx);
    (logger);
    (service);

    //throw "Not Implemented";
    return null;

}
export function getStore(ctx: IMeshServiceContext) {
    ctx.ServiceProvider.getBus();
}

declare module '../infrastructure/mesh/IMeshServiceContext' {
    interface IMeshServiceContext {
        getHelper(): MeshServiceHelper
    }
}

declare module '../infrastructure/mesh/MeshServiceContext' {
    interface MeshServiceContext {
        getHelper(): MeshServiceHelper;
    }
}
MeshServiceContext.prototype.getHelper = function () {

    return new MeshServiceHelper(this as IMeshServiceContext);
}