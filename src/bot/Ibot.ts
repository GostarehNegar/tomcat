import { IMeshService, IMeshServiceContext, ServiceInformation } from "../infrastructure/mesh";

export interface IBot extends IMeshService {

}
export class Bot implements IBot {
    get info(): ServiceInformation {
        throw new Error("Method not implemented.");
    }
    run(ctx?: IMeshServiceContext): Promise<ServiceInformation> {
        (ctx);
        throw new Error("Method not implemented.");
    }
    Id: string;

}
