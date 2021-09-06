import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';

const tableName = 'indicatorCache'
const _createTable = () => {
    return `CREATE TABLE IF NOT EXISTS ${tableName} (
    key CHAR PRIMARY KEY,
    time INTEGER NOT NULL,
    ID CHAR NOT NULL,
    value REAL
    )
`;
};

class indicatorDTO {
    key: string;
    time: number;
    id: string;
    value: number;
}

export class IndicatorDB {
    public db: Database;
    private _ensured = false;

    public async open(): Promise<Database> {
        if (this.db != null) return this.db;
        this.db = new Database({
            filename: './db/indicatorCache.db',
            driver: sqlite3.Database,
        });
        await this.db.open();
        if (!this._ensured) await this.ensureTable();
        return this.db;
    }
    public async ensureTable() {
        if (this._ensured) return;
        const db = await this.open();
        await db.exec(_createTable());
        this._ensured = true;
    }
    public async getIndicatorValue(time, indicatorId): Promise<indicatorDTO> {
        const db = await this.open();
        const key = `${indicatorId}-${time}`
        const res = await db.get(
            `SELECT * FROM ${tableName} WHERE key = '${key}';`
        );
        return res
    }
    public async setIndicatorValue(time, indicatorId, value) {
        const db = await this.open();

        const key = `${indicatorId}-${time}`
        await db.exec(
            `INSERT OR IGNORE INTO ${tableName} (key, time, ID, value) VALUES ('${key}',${time},'${indicatorId}',${value})`
        );



    }
}