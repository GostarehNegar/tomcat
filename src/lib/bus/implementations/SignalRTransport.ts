import * as SignalR from '@microsoft/signalr';

import { IMessage } from "../interfaces";
export class SignalRTransport {
  private connection: SignalR.HubConnection = null;
  constructor() {
    this.connection;
  }
  public getConnection(): SignalR.HubConnection {
    if (this.connection == null) {
      this.connection = new SignalR.HubConnectionBuilder()
        .withUrl('http://localhost:5000/hub')
        .build();
    }
    // this.connection.on('publish', () => {

    // });
    return this.connection;
  }
  public start(): Promise<void> {
    return this.getConnection().start();
  }
  public get isConected(): boolean {
    return this.getConnection().state == SignalR.HubConnectionState.Connected;
  }
  public publish(message: IMessage): Promise<any> {
    return this.isConected
      ? this.getConnection().invoke('publish', message)
      : Promise.resolve();
  }
  public stop(): Promise<void> {
    return this.getConnection().stop();
  }
}
