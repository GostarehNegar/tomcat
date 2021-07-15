class ServiceDef {
  name = '';
  cnst: any;
  instanceName = '';
}
export interface IServiceLocator {
  register(serviceName: any, constructor: any, instanceName?: any | null): any;
  getService<T>(serviceName: string, insanceName?: string | null): T;
}
export class ServiceLocator implements IServiceLocator {
  private serviceDefinitions: ServiceDef[] = [];

  register(serviceName: any, constructor: any, instanceName?: any) {
    instanceName = instanceName || 'nodef';
    const current = this.serviceDefinitions.findIndex(
      (s) => s.name === serviceName && s.instanceName === instanceName
    );
    const def: ServiceDef = {
      name: serviceName,
      cnst: constructor,
      instanceName: instanceName,
    };
    if (current < 0) this.serviceDefinitions.push(def);
    else this.serviceDefinitions[current] = def;
    return def;
  }
  public getService<T>(serviceName: string, instanceName?: string | null): T {
    let result = undefined;
    instanceName = instanceName || 'nodef';
    const services = this.serviceDefinitions.filter(
      (s) => s.name === serviceName && s.instanceName === instanceName
    );
    if (services.length > 0) {
      const def = services[services.length - 1];

      result = typeof def.cnst === 'function' ? new def.cnst(this) : def.cnst;
    }
    return result;
  }
}
const instance = new ServiceLocator();
//export const ServiceLocator: IServiceLocator = new _ServiceLocator();
export default instance;
