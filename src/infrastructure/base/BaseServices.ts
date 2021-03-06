import { IMessageBus } from '../bus';
import { IStoreFactory } from '../data/IStoreFactory';
import { IClock, IRedisClientFactory } from '../services';
import { IStopService } from "../services/IStopService";

import provider from './ServiceProvider'
import { BaseConstants } from './baseconstants';
//import { IStopCallBack, IStopContext, StopTypes } from './stop'

import { IServiceProvider } from '.';
//import { IServiceRegistrar } from './IServiceRegistrar';
//import { IServiceRegistrar } from './IServiceRegistrar'
const names = BaseConstants.ServiceNames;

export class BaseServices {
    readonly Provider: IServiceProvider = provider;
    getBus() {
        return provider.getService<IMessageBus>(names.IMessageBus);
    }
    getClock() {
        return provider.getService<IClock>(names.IClock);
    }
    getStop = () => provider.getService<IStopService>(names.IStopService);
    getRedisFactory = () => provider.getService<IRedisClientFactory>(names.IRedisClientFactory);
    getStoreFactory = () => provider.getService<IStoreFactory>(names.IStoreFactory);

    static Instance = new BaseServices();
}

export default BaseServices.Instance;
