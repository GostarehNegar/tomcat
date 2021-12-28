// import * as base from './BaseServices'
import * as container from './ServiceProvider';
//import { BaseServiceRegistrar } from './BaseRegistrar'
export * from './ServiceProvider';
export * from './TimeEx'
export * from './baseUtils'
export * from './logger'
export * from "./ILogger"
export * from './SequentialPromise'
export * from './CancellationTokenSource'
export * from './exception'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export import IServiceProvider = container.IServiceProvider;

//export const Services = base.BaseServices.Instance;

// export import BaseServices = base.BaseServices;
// export const services = () => {
//     return base.BaseServices.Instance;
// }
// import * as baseRegistrar from './BaseRegistrar'
// baseRegistrar.instance.registerServices();
// export import BaseRegistrar = baseRegistrar.instance;


