
//import { IStopCallBack, IStopContext, StopTypes } from './stop'
import { StoreFactory } from '../data';
import { Clock, NodeManagerService, RedisClientFactory } from '../services';
import { RedisCacheService } from '../services/redis/RedisCacheService'
import { SerializationService } from '../services/SerializationService'
import { StopService } from '../services/stop'

import provider, { IServiceProvider } from './ServiceProvider'
import { BaseConstants } from './baseconstants';
import baseconfig from './baseconfig';
import { BaseUtilityService } from '../services/utility/BaseUtilityService';
import { DockerService } from '../services/docker/DockerService';
import { ProcessManager } from '../services/processManager/ProcessManager';

const names = BaseConstants.ServiceNames;


const register = (services: IServiceProvider) => {
    const clock = new Clock();
    const stop = new StopService(services);

    const redis = new RedisClientFactory(baseconfig.data.redisEx);
    const store = new StoreFactory(services);
    const nodeManagerService = new NodeManagerService(services)
    const utility = new BaseUtilityService(services);
    const docker = new DockerService();
    const processManager = new ProcessManager();
    services.register(names.IClock, () => clock, true);
    services.register(names.IStopService, () => stop, true);
    services.register(names.IRedisClientFactory, () => redis, true);
    services.register(names.IStoreFactory, () => store, true);
    services.register(names.IDistrubutedCache, (sp: IServiceProvider) => new RedisCacheService(sp.getService(names.IRedisClientFactory)), true);
    services.register(names.ISerializationService, (sp: IServiceProvider) => new SerializationService(sp), true);
    services.register(names.INodeManagerService, () => nodeManagerService, true)
    services.register(names.BaseUtilityService, () => utility, true)
    services.register(names.IDockerService, () => docker, true)
    services.register(names.IProcessManager, () => processManager, true)

}
class BaseServiceRegistrar {
    constructor() {
        provider.register(names.IServiceRegistrar, this)

    }

    public regsiterCallBack() {
        provider.register(BaseConstants.Internals._ON_NEW_SERVICE_PROVIDER_, () => sp => {
            register(sp);
        });
    }
    public registerServices(serviceProvider: IServiceProvider = null) {
        serviceProvider = serviceProvider || provider;
        serviceProvider.register(BaseConstants.Internals._ON_NEW_SERVICE_PROVIDER_, () => sp => {
            register(sp);
        });
        register(serviceProvider);
    }
    public static Instance = new BaseServiceRegistrar();

}
export const instance = BaseServiceRegistrar.Instance;
export default BaseServiceRegistrar.Instance;