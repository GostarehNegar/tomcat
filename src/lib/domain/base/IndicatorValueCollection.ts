import { IIndicator } from "../data";

export class IndicatorValueCollection {
    // [key: string]: number | boolean;
    public values: { [index: string]: number | boolean; } = {};
    constructor(values?: { [index: string]: number | boolean; }) {
        this.values = values || {}
    }

    getValue<T>(indicator: IIndicator): T {
        return this.values[indicator.id] == null || this.values[indicator.id] == undefined ? null : this.values[indicator.id] as unknown as T;
    }
    setValue(indicator: IIndicator, value: number | boolean) {
        this.values[indicator.id] = value;
    }
    getNumberValue(indicator: IIndicator) {
        return this.getValue<number>(indicator);
    }
    getBoolValue(indicator: IIndicator) {
        return this.getValue<boolean>(indicator);
    }
    has(...indicators: IIndicator[]) {
        for (const i in indicators) {
            if (this.values[indicators[i].id] == null || this.values[indicators[i].id] == undefined) {
                return false;
            }
        }
        return true;
    }

}
