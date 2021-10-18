import { IFilterCallBack } from "../pipes";

export interface IIndicator {
    id: string;
    handler: IFilterCallBack
}