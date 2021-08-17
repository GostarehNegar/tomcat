import { IDataSource } from './base';

export * as Indicators from './indicators/_interfaces';
export * as Stores from './stores/_interfaces';
export * from './base/_interfaces';

export interface IDataProvider extends IDataSource {

}
