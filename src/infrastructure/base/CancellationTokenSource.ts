
export interface CancellationToken {
  get isCancelled(): boolean;
}
export class CancellationTokenSource implements CancellationToken {
  public isCancelled: boolean;
  private static instances: CancellationTokenSource[] = [];
  constructor() {
    this.isCancelled = false;
    CancellationTokenSource.instances.push(this);
  }
  public cancel() {
    this.isCancelled = true;
  }
  public static Instance = new CancellationTokenSource();
  public static cancelAll() {
    this.instances.forEach(x => x.cancel());
  }
}
