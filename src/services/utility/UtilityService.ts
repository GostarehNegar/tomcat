
import { IServiceProvider } from "../../infrastructure/base";
import { BaseUtilityService } from "../../infrastructure/services/utility/BaseUtilityService";

export class UtilityService extends BaseUtilityService {

    constructor(public ServiceProvider: IServiceProvider) {
        super(ServiceProvider)
    }


}