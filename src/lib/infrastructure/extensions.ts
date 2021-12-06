
import { ServiceProvider, IServiceProvider } from './base/ServiceProvider';
import { IClock, IStopService, IRedisClientFactory, IDistributedCacheService, ISerielizationService } from './services'
import { IStoreFactory } from './data/IStoreFactory'

import { BaseConstants } from './base/baseconstants'
import { IMessageBus } from './bus';
const names = BaseConstants.ServiceNames;
type ServiceTypes = '1' | '2';
declare module './base/ServiceProvider' {
    interface ServiceProvider {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getBaseService(s: ServiceTypes);
        getClock(): IClock;
        getStop(): IStopService;
        getRedisFactory(): IRedisClientFactory;
        getStoreFactory(): IStoreFactory;
        getCacheService(): IDistributedCacheService;
        getSerilizer(): ISerielizationService;
        getBus(): IMessageBus;
    }
    interface IServiceProvider {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getBaseService(s: ServiceTypes);
        getClock(): IClock;
        getStop(): IStopService;
        getRedisFactory(): IRedisClientFactory;
        getStoreFactory(): IStoreFactory;
        getCacheService(): IDistributedCacheService;
        getSerilizer(): ISerielizationService;
        getBus(): IMessageBus;

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
ServiceProvider.prototype.getCacheService = function (): IDistributedCacheService {
    return (this as IServiceProvider).getService<IDistributedCacheService>(names.IDistrubutedCache);
};

ServiceProvider.prototype.getSerilizer = function (): ISerielizationService {
    return (this as IServiceProvider).getService<ISerielizationService>(names.ISerializationService);
};
ServiceProvider.prototype.getBus = function (): IMessageBus {
    return (this as IServiceProvider).getService<IMessageBus>(names.IMessageBus);
};

// ServiceProvider.prototype.getBus() {
//     return provider.getService<IMessageBus>(names.IMessageBus);
// }
