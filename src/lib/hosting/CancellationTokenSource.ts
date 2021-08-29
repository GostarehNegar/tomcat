import { CanellationToken } from "./CanellationToken";

export class CancellationTokenSource implements CanellationToken {
  public isCancelled: boolean;
  constructor() {
    this.isCancelled = false;
  }
  public cancel() {
    this.isCancelled = true;
  }
}
