import provider, { IServiceProvider } from './ServiceProvider'

import { BaseConstats } from './baseconstants';
import { Clock, RedisClientFactory } from '../services';
//import { IStopCallBack, IStopContext, StopTypes } from './stop'
import { StopService } from '../services/stop'
import { StoreFactory } from '../data';

const names = BaseConstats.ServiceNames;


const register = (services: IServiceProvider) => {
    const clock = new Clock();
    const stop = new StopService(provider);
    const redis = new RedisClientFactory();
    const store = new StoreFactory();
    services.register(names.IClock, () => clock, true);
    services.register(names.IStopService, () => stop, true);
    services.register(names.IRedisClientFactory, () => redis, true);
    services.register(names.IStoreFactory, () => store, true);
}
class BaseServiceRegistrar {
    constructor() {
        provider.register(names.IServiceRegistrar, this)

    }

    public regsiterCallBack() {
        provider.register(BaseConstats.Internals._ON_NEW_SERVICE_PROVIDER_, () => sp => {
            register(sp);
        });
    }
    public registerServices(serviceProvider: IServiceProvider = null) {
        serviceProvider = serviceProvider || provider;
        serviceProvider.register(BaseConstats.Internals._ON_NEW_SERVICE_PROVIDER_, () => sp => {
            register(sp);
        });
        register(serviceProvider);
    }
    public static Instance = new BaseServiceRegistrar();

}

export default BaseServiceRegistrar.Instance;