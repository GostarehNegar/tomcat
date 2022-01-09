import { BaseUtils, IServiceProvider } from "../../base";
import { BaseConstants } from "../../base/baseconstants";
import { IProcessManager } from "../processManager/IProcessManager";


export class BaseUtilityService extends BaseUtils {

    constructor(public ServiceProvider: IServiceProvider) {
        super()
    }
    public getServiceProvider(): IServiceProvider {
        return this.ServiceProvider;
    }
    public getProcessManager(): IProcessManager {
        return this.ServiceProvider.getService<IProcessManager>(BaseConstants.ServiceNames.IProcessManager);
    }


}