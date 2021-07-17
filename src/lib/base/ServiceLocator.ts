class ServiceDef {
  name = '';
  cnst: any;
  instanceName = '';
}
export interface IServiceLocator {
  register(serviceName: any, constructor: any, instanceName?: any | null): any;
  getService<T>(serviceName: string, insanceName?: string | null): T;
  getServices<T>(serviceName: string): T[];
}
export class ServiceLocator implements IServiceLocator {
  private serviceDefinitions: ServiceDef[] = [];

  register(serviceName: any, constructor: any, instanceName?: any) {
    instanceName = instanceName || 'nodef';
    // const current = this.serviceDefinitions.findIndex(
    //   (s) => s.name === serviceName && s.instanceName === instanceName
    // );
    const def: ServiceDef = {
      name: serviceName,
      cnst: constructor,
      instanceName: instanceName,
    };
    this.serviceDefinitions.push(def)
    // if (1==1 ||current < 0) this.serviceDefinitions.push(def);
    // else this.serviceDefinitions[current] = def;
    return def;
  }
  public getService<T>(serviceName: string, instanceName?: string | null): T {
    let result = undefined;
    instanceName = instanceName || 'nodef';
    const services = this.serviceDefinitions.filter(
      (s) => s.name === serviceName && s.instanceName === instanceName
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
const instance = new ServiceLocator();
//export const ServiceLocator: IServiceLocator = new _ServiceLocator();
export default instance;
