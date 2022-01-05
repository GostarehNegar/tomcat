import { BotHost, IBotHost } from './bot/botHost';
import _utils from './common/Domain.Utils'
import { config as _config } from './config'
import { Constants } from './constants'
import * as _Domain from './domain'
import * as _Infrastructure from "./infrastructure"
import { ServiceProvider } from './infrastructure/base';
import './extensions'



import { HostBuilder, IHostBuilder } from './infrastructure/hosting';
import { RegsiterDomainServices } from './services';
let provider = ServiceProvider.instance;
namespace tomcat {
    export const utils = _utils
    export const constants = Constants;
    export const config = _config;
    export const services = () => provider;
    // export const hosts = _Infrastructure.Hosting.hosts;
    export const createBot = (name: string): IBotHost => { return new BotHost(name, new ServiceProvider()) }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export import Infrastructure = _Infrastructure
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export import Domain = _Domain

    export const getHostBuilder = (name: string): IHostBuilder => {
        var res = new HostBuilder(name, null)
        provider = res.services;
        RegsiterDomainServices(res.services);
        return res;
    }

}
export default tomcat;
