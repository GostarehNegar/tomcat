class ServiceDef {
  name = '';
  cnst: any;
  identifier = '';
}
const noname = "nodef";
export interface IServiceContainer {
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
    constructor: ((s: IServiceContainer) => unknown) | unknown,
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
    identifier?: string);
  getService<T>(serviceName: string, identifier?: string | null): T;
  getServices<T>(serviceName: string): T[];
}
export class ServiceContainer implements IServiceContainer {
  private serviceDefinitions: ServiceDef[] = [];

  findFirstIndex(serviceName: any, instanceName: any) {
    return this
      .serviceDefinitions
      .findIndex((s) => s.name === serviceName && s.identifier === instanceName);
  }
  register(serviceName: string, constructor: unknown, isNew?: boolean, idenitier?: string,) {
    idenitier = idenitier || noname;
    const def: ServiceDef = {
      name: serviceName,
      cnst: constructor,
      identifier: idenitier,
    };
    if (isNew && this.findFirstIndex(serviceName, idenitier) > -1) {

      return def;
    }
    let current = idenitier == noname
      ? -1
      : this.findFirstIndex(serviceName, idenitier);
    if (current < 0)
      this.serviceDefinitions.push(def);
    else
      this.serviceDefinitions[current] = def;
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
  private _ctor(def: ServiceDef): any {
    if (typeof def.cnst === 'function') {
      try { return new def.cnst(); } catch { }
      return def.cnst(this);
    }
    return def.cnst
  }
  public getServices<T>(serviceName: string): T[] {
    var result: T[] = [];
    this.serviceDefinitions
      .filter((s) =>
        s.name === serviceName
      )
      .forEach(s =>
        result.push(this._ctor(s)) // s.cnst === 'function' ? s.cnst(this) : s.cnst)
      );

    return result;

  }
}
//const services: IServiceContainer = new ServiceContainer();
//export const ServiceLocator: IServiceLocator = new _ServiceLocator();
//export default services;
