import { Utils } from "../../common";
import { IServiceProvider } from "../../infrastructure/base";

export class UtilityService extends Utils {

    constructor(public ServiceProvider: IServiceProvider) {
        super()
    }
    public getServiceProvider(): IServiceProvider {
        return this.ServiceProvider;
    }


}