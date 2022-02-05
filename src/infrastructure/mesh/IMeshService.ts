import { baseUtils } from "../base";

import { IMeshServiceContext } from "./IMeshServiceContext";
import { ServiceInformation } from "./ServiceDefinition";

import { ServiceDefinition } from ".";

//import { ServiceDefinition } from ".";
export interface IMeshServiceMain {
    (ctx?: IMeshServiceContext): Promise<unknown>;
}
export interface IMeshService {
    info: ServiceInformation;
    /**
     * service main entry function. This is called by the MeshNode
     * to run the service.
     * Note that this function should not return until a stop request. 
     * Infact upon return from this function the system assumes that the
     * service has done it's main activity and has nothing to do. It then
     * will be considered as a 'stopped' service. Therefore start requests
     * will start a new instance of it!
     * To acheive this functionality one should return a Promise that
     * only is resolved appropriately.
     * One way of doing that will be using a while loop using ctx.shoulStop.
     * Then the main body of function would be:
     * {
     *      // initialize stuff
     *      // bus subscriptions should be done here
     *      
     *      while(!await ctx.shouldStop()){
     *          // Do some job
     *      }
     *      // cleanup (bus unsubscribe, ...)
     *      //
     * }
     * 
     * 
     * @param ctx 
     */
    run(ctx?: IMeshServiceContext): Promise<unknown>;

}
export class MeshServiceBase implements IMeshService {
    information: ServiceInformation = new ServiceInformation();
    constructor(public definiton: ServiceDefinition) {
        this.definiton = baseUtils.extend(new ServiceDefinition(), definiton);
        this.information.definition = definiton;
    }
    async run(ctx?: IMeshServiceContext): Promise<unknown> {
        (ctx);
        this.information.status = 'started';
        await Promise.resolve();
        this.information.status = 'stop';
        return this.information;
    }
    get info(): ServiceInformation {
        return this.information;
    }
}
