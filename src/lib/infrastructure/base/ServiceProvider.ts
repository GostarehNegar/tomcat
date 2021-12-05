import { BaseConstants } from "./baseconstants";


/**
 * ServiceProvider
 * An implementation of 'ServiceProvider' pattern in favor of
 * replacing dependencies on 'concrete classes' with 'interfaces'.
 * The idea is to expose services only with interfaces. The user
 * is not much concerned about the implementaion or instantiaion
 * of the service:
 *      const mailService = provider.getService<IMailService>();
 * instead of:
 *      const mailService = new MailService(param1,param2,...)
 * Due to lack of metadata and refelection in java script
 * services are identified with a service name, therefore in addition
 * to the interface, we also need an interface name, which is
 * in convention almost always equals the intrface name:
 *        getService<IService>('IService')
 * Registration
 * Services are registered persumably in the very initial stage of
 * a program. This is often called Service Composition. The service
 * composer, registers each service with a name and a constuctor:
 *        provider.register("ILogger", s=> new Logger());
 * Note that the constructor hase one paramter that is an instance
 * of the service provider. This is helpful when the constructor needs
 * other services:
 *        provider.register("UserService", s=> new UserService(s.getService('mail')))
 * This is possible to provide an object instance instead of a constructor.
 * This provides sort of singleton/static registeration:
 *        provider.register("Port",8080)
 * Which is essentially same as:
 *        provider.register("Port", s=> 8080);
 * Although it is highly recommended to use the function approach to
 * keep consistency.
 *
 * Multiple Registrations:
 * It is possible to register multiple services with the same name:
 *        provider.register("IHostedService", s=> new Service1())
 *        provider.register("IHostedService", s=> new Service2())
 * Please note that the 'getService' method always returns the last
 * registration (Service2 in above example). While 'getSevices'
 * returns all of the services with that name:
 *        provider.getServices('IHostedService')
 * will return both 'Service1' and 'Service2'. Tis become handy for
 * instance when may for instance start all HostedServices. Note
 * that in this case it is assumed that all those services implement
 * the same interface.
 * Mutiple registrations may be futher accompanied with a sort of
 * 'identifier' which identifies each registeration.
 * For example:
 *        provider.register('config', 8080,'port')
 *        provider.register('config', '172.16.6.0', 'ip')
 * where
 *        provider.getSevice('config','port') returns 8080
 *        provider.getSevice('config','ip') returns '172.16.6.0'
 *        provider.getServices('config') returns [8080,'172.16.6.0']
 *
 */

/**
 * Simple structure to track service definitions.
 */

class ServiceDef {
  name = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cnst: any;
  identifier = '';
}
const noname = 'nodef';
const _ON_NEW_SERVICE_PROVIDER_ = BaseConstants.Internals._ON_NEW_SERVICE_PROVIDER_;
/**
 * Represents a ServiceProvider that is capable of
 * returning service instances based on service names,
 * that is used in sort of 'ServiceLocator/ServiceProvider'
 * pattern. Services are 'registered' with names, and may
 * be later retrieved wiht 'getService' method.
 */
export interface IServiceProvider {
  /**
   * Registers a service name with a constructor for
   * that service. The constructor is a function that
   * accepts an instance of ServiceProvider and returns
   * an instance of the service.
   * @param name
   * @param constructor
   * @param ifNew
   * @param identifier
   */
  register(
    /**
     * The name of this service.
     * This will be used later in getService
     *
     */
    name: string,
    /**
     * Can be either a constructor function, a constructor
     * or simply an instance:
     * 's=> return new Class()' or 'Class' or 'new Class()'
     * Note by reistering an instance later getServices will
     * return the same instance (singlton pattern)
     */
    constructor: ((s: IServiceProvider) => unknown) | unknown,
    /**
     * Register only if not already registerd previously.
     */
    ifNew?: boolean,
    /**
     * Multiple registeration of the same service can be
     * identified. For example: register("config",33,false,"port");
     * register("config","localhost", false, "server") and then
     * getService("config","port"). Note that in this case
     * getServices("config") will return both.
     */
    identifier?: string
  );

  /**
   * Returns an instance of the requested
   * service identified with a service name.
   * @param serviceName The name of the service. Often the name of class or interface
   * for that service. getService<IService>('IService');
   * @param identifier
   */
  getService<T>(serviceName: string, identifier?: string | null): T;

  /**
   * Retruns an array of services registerd with
   * the same name.
   * @param serviceName
   */
  getServices<T>(serviceName: string): T[];
}

export class ServiceProvider implements IServiceProvider {
  private serviceDefinitions: ServiceDef[] = [];
  constructor() {

    if (ServiceProvider.instance) {
      const callbacks = ServiceProvider.instance.getServices(_ON_NEW_SERVICE_PROVIDER_);
      callbacks.forEach(x => {
        if (x) {
          try { (x as (sp: IServiceProvider) => void)(this) } catch { }
        }

      });
    }

    ServiceProvider.instances.push(this);
    ServiceProvider.instance = this;
  }
  static instances: IServiceProvider[] = [];
  static instance: IServiceProvider = new ServiceProvider();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findFirstIndex(serviceName: any, instanceName: any) {
    return this.serviceDefinitions.findIndex(
      (s) => s.name === serviceName && s.identifier === instanceName
    );
  }
  register(
    serviceName: string,
    constructor: unknown,
    isNew?: boolean,
    idenitier?: string
  ) {
    idenitier = idenitier || noname;
    const def: ServiceDef = {
      name: serviceName,
      cnst: constructor,
      identifier: idenitier,
    };
    if (isNew && this.findFirstIndex(serviceName, idenitier) > -1) {
      return def;
    }
    const current =
      idenitier == noname ? -1 : this.findFirstIndex(serviceName, idenitier);
    if (current < 0) this.serviceDefinitions.push(def);
    else this.serviceDefinitions[current] = def;
    return def;
  }

  public getService<T>(serviceName: string, identifier?: string | null): T {
    let result = undefined;
    identifier = identifier || 'nodef';
    const services = this.serviceDefinitions.filter(
      (s) => s.name === serviceName && s.identifier === identifier
    );
    if (services.length > 0) {
      result = this._ctor(services[services.length - 1]);
      // result = typeof def.cnst === 'function' ? def.cnst(this) : def.cnst;
    }
    return result;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _ctor(def: ServiceDef): any {
    if (typeof def.cnst === 'function') {
      try {
        return new def.cnst();
      } catch { (1) }
      return def.cnst(this);
    }
    return def.cnst;
  }
  public getServices<T>(serviceName: string): T[] {
    const result: T[] = [];
    this.serviceDefinitions
      .filter((s) => s.name === serviceName)
      .forEach(
        (s) => result.push(this._ctor(s)) // s.cnst === 'function' ? s.cnst(this) : s.cnst)
      );

    return result;
  }
}

export default ServiceProvider.instance;
