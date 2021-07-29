import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { ICandelStickData } from '../../base/interfaces';
import { CandleStick } from './Models';


// const _getCandleValues = (model: CandleStickType) => {
//   return `
//     ${model.openTime}, 
//     ${model.open},${model.high},${model.low},${model.close},
//     ${model.closeTime},
//     ${model.volume || null}, ${model.amount || null}, 
//     ${model.V1 || null},${model.V2 || null},${model.V3 || null},${model.V4 || null}
// `
// }
const _getCandleValuesEx = (models: ICandelStickData[]) => {
  const _get = (model: ICandelStickData) => {
    return `
    (
      ${model.openTime}, 
      ${model.open},${model.high},${model.low},${model.close},
      ${model.closeTime},
      ${model.volume || null}, ${model.amount || null}, 
      ${model.V1 || null},${model.V2 || null},${model.V3 || null},${model.V4 || null})`
  }
  if (models == null)
    return '';
  const items = models as ICandelStickData[];
  let res = "VALUES ";
  if (typeof items.map == 'function') {
    items.map((v, i) => {
      res += `${i == 0 ? '' : ','} ${_get(v)}`
    });

  }
  return res + ';'
  // const model = models as CandleStickType
  // return `
  //   (
  //     ${model.openTime}, 
  //     ${model.open},${model.high},${model.low},${model.close},
  //     ${model.closeTime},
  //     ${model.volume || null}, ${model.amount || null}, 
  //     ${model.V1 || null},${model.V2 || null},${model.V3 || null},${model.V4 || null})`
}

const _insert = (market: string, model: ICandelStickData[]) => {
  return `
  INSERT OR IGNORE INTO ${market} (openTime, open, high, low, close, closeTime, volume, amount, V1, V2, V3, V4)
  ${_getCandleValuesEx(model)};
  `
}

const _replace = (market: string, model: ICandelStickData[]) => {
  return `
  REPLACE INTO ${market} (openTime, open, high, low, close, closeTime, volume, amount, V1, V2, V3, V4)
  ${_getCandleValuesEx(model)};
  `
}
const _createTable = (name: string) => {
  return `CREATE TABLE IF NOT EXISTS ${name} (
    openTime INTEGER PRIMARY KEY,
    open  REAL NOT NULL,
    high  REAL NOT NULL,
    low   REAL NOT NULL,
    close REAL NOT NULL,
    closeTime INTEGER NOT NULL,
    volume REAL,
    amount REAL,
    V1 REAL,
    V2 REAL,
    V3 REAL,
    V4 REAL
    )
`;
};

const _select = (market: string) => {
  return `
SELECT * FROM ${market}
`

}
(_replace);
(_insert)

export class CandleStickLiteDb {
  private _ensured: boolean = false;
  private _isDbOpen: boolean = false;
  private db: Database;
  private config: { filename: string };

  constructor(public exhange: string, public market: string) {
    this.config = {
      filename: `./db/ ${exhange}.db`,
    };

  }

  public get isOpen(): boolean {
    return this._isDbOpen;
  }
  public get fileName() {
    return this.config.filename;
  }
  public async open(): Promise<Database> {
    if (this.db != null)
      return this.db;
    this.db = new Database({
      filename: "./db/" + this.exhange + ".db",
      driver: sqlite3.Database,
    });
    await this.db.open();
    if (!this._ensured)
      await this.ensureTable();
    return this.db;
  }
  public async close() {
    await this.db.close();
    this.db = null;
  }
  public get table(): string {
    return this.market;
  }

  public async push(model: ICandelStickData | CandleStick | ICandelStickData[] | CandleStick[], replace?: boolean) {
    if (model == null)
      return;
    let models: ICandelStickData[] = [];
    if (Array.isArray(model)) {
      model.map(m => models.push(new CandleStick(m).data))
    }
    else {
      models.push(new CandleStick(model).data)
    }
    const db = await this.open();
    await db.exec(
      replace
        ? _replace(this.table, models)
        : _insert(this.table, models));
  }



  public async exists(openTime: number): Promise<boolean> {

    const db = await this.open();
    const res = await db.get<{ value: number }>(
      `SELECT EXISTS(SELECT 1 FROM ${this.table} WHERE openTime = ${openTime}) as value; `);
    return res.value == 1;
  }

  public async select() {
    //await this.open();
    return (await this.db.all(_select(this.table)));
  }
  public async ensureTable() {
    if (this._ensured)
      return;
    const db = await this.open();
    await db.exec(_createTable(this.table));
    this._ensured = true;
  }
  public async run(cb: () => Promise<void>) {

    await this.open();
    await this.ensureTable();
    try {
      await cb()
    }
    finally {
      this.close();
    }
  }
  public async clear() {
    const db = await this.open();
    await db.exec(`DELETE from ${this.table}`)
  }
  public async count(time: number, order: "after" | "before") {
    const db = await this.open();
    let where = `where openTime>${time}`;
    switch (order) {
      case "after":
        where = `where openTime>${time}`;
        break;
      case "before":
        where = `where openTime>${time}`
        break;
    }


    return (await db.get<{ value: number }>(`COUNT (*) as value from ${this.table} ${where}`))
      .value;
  }

  public async getBounds() {
    const db = await this.open();
    const min = (await db.get<{ value: number }>(`SELECT MIN(openTime) as value from ${this.table} `))
      .value;
    const max = (await db.get<{ value: Number }>(`SELECT MAX(openTime) as value from ${this.table} `))
      .value;
    return {
      min,
      max
    }
  }

}

