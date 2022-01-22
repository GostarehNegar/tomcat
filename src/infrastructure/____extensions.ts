
import { IServiceProvider, ServiceProvider } from './base/ServiceProvider';
import { BaseConstants } from './base/baseconstants'
import { IMessageBus } from './bus';
import { IStoreFactory } from './data/IStoreFactory'
import { IServiceDiscovery } from './mesh/IServiceDiscovery';
import { IClock, IDistributedCacheService, INodeManagerService, IRedisClientFactory, ISerielizationService, IStopService } from './services'
import { IDockerService } from './services/docker/IDockerServices';
import { IProcessManager } from './services/processManager/IProcessManager';
const names = BaseConstants.ServiceNames;
type ServiceTypes = '1' | '2';
declare module './base/ServiceProvider' {
    interface ServiceProvider {
        getBaseService(s: ServiceTypes);
        getClock(): IClock;
        getStop(): IStopService;
        getRedisFactory(): IRedisClientFactory;
        getStoreFactory(): IStoreFactory;
        getCacheService(): IDistributedCacheService;
        getSerilizer(): ISerielizationService;
        getBus(): IMessageBus;
        getServiceDiscovery(): IServiceDiscovery
        getNodeManagerService(): INodeManagerService
        getDocker(): IDockerService;
        getProcessManager(): IProcessManager;
    }
    interface IServiceProvider {
        getBaseService(s: ServiceTypes);
        getClock(): IClock;
        getStop(): IStopService;
        getRedisFactory(): IRedisClientFactory;
        getStoreFactory(): IStoreFactory;
        getCacheService(): IDistributedCacheService;
        getSerilizer(): ISerielizationService;
        getBus(): IMessageBus;
        getServiceDiscovery(): IServiceDiscovery
        getNodeManagerService(): INodeManagerService;
        getDocker(): IDockerService;
        getProcessManager(): IProcessManager;

    }

}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
ServiceProvider.prototype.getServiceDiscovery = function (): IServiceDiscovery {
    return (this as IServiceProvider).getService<IServiceDiscovery>(names.IServiceDiscovery);
};
ServiceProvider.prototype.getNodeManagerService = function (): INodeManagerService {
    return (this as IServiceProvider).getService<INodeManagerService>(names.INodeManagerService);
}
ServiceProvider.prototype.getDocker = function (): IDockerService {
    return (this as IServiceProvider).getService<IDockerService>(names.IDockerService);
}
ServiceProvider.prototype.getProcessManager = function (): IProcessManager {
    return (this as IServiceProvider).getService<IProcessManager>(names.IProcessManager);
}


// ServiceProvider.prototype.getBus() {
//     return provider.getService<IMessageBus>(names.IMessageBus);
// }
