
import { ServiceProvider, IServiceProvider } from './base/ServiceProvider';
import { IClock, IStopService, IRedisClientFactory } from './services'
import { IStoreFactory } from './data/IStoreFactory'
import { BaseConstats } from './base/baseconstants'
const names = BaseConstats.ServiceNames;
type ServiceTypes = '1' | '2';
declare module './base/ServiceProvider' {
    interface ServiceProvider {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getBaseService(s: ServiceTypes);
        getClock(): IClock;
        getStop(): IStopService;
        getRedisFactory(): IRedisClientFactory;
        getStoreFactory(): IStoreFactory;
    }
    interface IServiceProvider {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getBaseService(s: ServiceTypes);
        getClock(): IClock;
        getStop(): IStopService;
        getRedisFactory(): IRedisClientFactory;
        getStoreFactory(): IStoreFactory;
    }

}
ServiceProvider.prototype.getBaseService = function (): any {
    return "";
};
ServiceProvider.prototype.getClock = function (): IClock {
    return (this as IServiceProvider).getService<IClock>(names.IClock);
};
ServiceProvider.prototype.getStop = function (): IStopService {
    return (this as IServiceProvider).getService<IStopService>(names.IStopService);
};
ServiceProvider.prototype.getRedisFactory = function (): IRedisClientFactory {
    return (this as IServiceProvider).getService<IRedisClientFactory>(names.IRedisClientFactory);
};
ServiceProvider.prototype.getStoreFactory = function (): IStoreFactory {
    return (this as IServiceProvider).getService<IStoreFactory>(names.IStoreFactory);
};

// ServiceProvider.prototype.getBus() {
//     return provider.getService<IMessageBus>(names.IMessageBus);
// }
