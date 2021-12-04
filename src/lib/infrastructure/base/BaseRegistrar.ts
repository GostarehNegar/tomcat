import provider, { IServiceProvider } from './ServiceProvider'

import { BaseConstants } from './baseconstants';
import { Clock, RedisClientFactory } from '../services';
//import { IStopCallBack, IStopContext, StopTypes } from './stop'
import { StopService } from '../services/stop'
import { StoreFactory } from '../data';
import { RedisCacheService } from '../services/RedisCacheService'

const names = BaseConstants.ServiceNames;


const register = (services: IServiceProvider) => {
    const clock = new Clock();
    const stop = new StopService(provider);
    const redis = new RedisClientFactory();
    const store = new StoreFactory(services);
    services.register(names.IClock, () => clock, true);
    services.register(names.IStopService, () => stop, true);
    services.register(names.IRedisClientFactory, () => redis, true);
    services.register(names.IStoreFactory, () => store, true);
    services.register(names.IDistrubutedCache, (sp: IServiceProvider) => new RedisCacheService(sp.getService(names.IRedisClientFactory)), true);

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