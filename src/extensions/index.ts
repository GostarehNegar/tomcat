import '../infrastructure/extensions';
import './MeshServiceContextExtensions'
import config from '../config';
import Constants from '../constants';
import { IServiceProvider, ServiceProvider } from '../infrastructure/base/ServiceProvider';
import { UtilityService } from '../services/utility/UtilityService';
import { IDomainServices } from '../services/IDomainServices';
export * from './MeshServiceContextExtensions'

//import {IMessageBus} from './infrastructure/bus/IMessageBus'

// declare module './infrastructure/bus/IMessageBus' {
//   interface IMessageBus {
//     ggg(): void;
//   }
// }

// declare module './infrastructure/bus/MessageBus' {
//   interface MessageBus {

//   }
// }


declare module '../infrastructure/base/ServiceProvider' {
    interface ServiceProvider {
        getConfig(): typeof config;
        getUtility(): UtilityService;
        getDomainServices(): IDomainServices
    }
    interface IServiceProvider {
        getConfig(): typeof config;
        getUtility(): UtilityService;
        getDomainServices(): IDomainServices;
    }
}
ServiceProvider.prototype.getConfig = function (): typeof config {
    return (this as IServiceProvider).getService(Constants.ServiceNames.Config);
};
ServiceProvider.prototype.getUtility = function (): UtilityService {
    return (this as IServiceProvider).getService<UtilityService>(Constants.ServiceNames.IUtilityServices);
};
ServiceProvider.prototype.getDomainServices = function (): IDomainServices {
    return (this as IServiceProvider).getService<IDomainServices>(Constants.ServiceNames.IDomainServices);
};