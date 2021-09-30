import { IFilterCallBack } from "../strategy";

export interface IIndicator {
    id: string;
    handler: IFilterCallBack
}