import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';

export class CandleStickLiteDb extends Database {
  createTable = (name: string) => {
    return `CREATE TABLE ${name} (col TEXT)`;
  };
  constructor(name: string) {
    super({
      filename: name,
      driver: sqlite3.Database,
    });
  }
  public async CreateTable(exchange: string) {
    await this.open();
    await this.exec(this.createTable(exchange));
    await this.close();
  }
  public static Open(name: string): CandleStickLiteDb {
    return new CandleStickLiteDb(name);
  }
}
