
import { HostBuilder } from './HostBuilder';
import { IHost } from './IHost';
import { IHostBuilder } from './IHostBuilder';
import { IHostCollection } from './IHostCollection';

export class HostCollection implements IHostCollection {
  get current(): IHost {
    if (this.items.size == 0) {
      this.getHostBuilder(null).build();
    }
    const vals = Array.from(this.items.values());
    return vals[vals.length - 1];
  }
  private items: Map<string, IHost> = new Map<string, IHost>();
  public getByName(name: string): IHost {
    return this.items.get(name);
  }
  public add(name: string, item: IHost): IHost {
    this.items.set(name, item);
    return item;
  }
  public getHostBuilder(name: string): IHostBuilder {
    name;
    return new HostBuilder(name);
  }
}
export const hosts = new HostCollection();
