import Constants from "../constants";
import { IServiceProvider } from "../infrastructure/base";
import BaseRegistrar from "../infrastructure/base/BaseRegistrar";
import { DomainServices } from "./DomainServices";
import { UtilityService } from "./utility/UtilityService";
const name = Constants.ServiceNames;



export function RegsiterDomainServices(serviceProvider: IServiceProvider) {
    (serviceProvider);
    BaseRegistrar.registerServices(serviceProvider);
    serviceProvider.register(name.IUtilityServices, (sp: IServiceProvider) => new UtilityService(sp), true);
    serviceProvider.register(name.IDomainServices, (sp: IServiceProvider) => new DomainServices(sp), true);

}