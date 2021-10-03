import { dep_IIndicator } from "../data";
import { IIndicator } from "../indicators";

type indicatorValues = { [index: string]: number | boolean; };

export class IndicatorValueCollection {
    // [key: string]: number | boolean;
    public values: indicatorValues = {};
    constructor(values?: indicatorValues) {
        // if (values && values.values) {
        //     this.values = values.values as unknown as indicatorValue 
        // } else {
        this.values = values || {}
        // }
    }
    private _getID(indicator: IIndicator | string) {
        return indicator == null ?
            'unknown'
            : typeof indicator === 'string' ?
                indicator
                : indicator.id
    }
    getValue_deprecated<T>(indicator: dep_IIndicator): T {
        return this.values[indicator.id] == null || this.values[indicator.id] == undefined ? null : this.values[indicator.id] as unknown as T;
    }
    getValue<T>(indicator: IIndicator | string): T {
        const id = this._getID(indicator)
        const value = this.values[id];
        (id);
        (value);
        return this.values[this._getID(indicator)] == null || this.values[this._getID(indicator)] == undefined ? null : this.values[this._getID(indicator)] as unknown as T;
    }
    setValue_depricated(indicator: dep_IIndicator, value: number | boolean) {
        this.values[indicator.id] = value;
    }
    setValue(indicator: IIndicator | string, value: number | boolean) {
        this.values[this._getID(indicator)] = value;
    }
    getNumberValue_deprecated(indicator: dep_IIndicator) {
        return this.getValue_deprecated<number>(indicator);
    }
    getNumberValue(indicator: IIndicator) {
        return this.getValue<number>(indicator);
    }
    getBoolValue_deprecated(indicator: dep_IIndicator) {
        return this.getValue_deprecated<boolean>(indicator);
    }
    getBoolValue(indicator: IIndicator) {
        return this.getValue<boolean>(indicator);
    }
    has_deprecated(...indicators: dep_IIndicator[]) {
        for (const i in indicators) {
            if (this.values[indicators[i].id] == null || this.values[indicators[i].id] == undefined) {
                return false;
            }
        }
        return true;
    }
    has(...indicators: IIndicator[] | string[]) {
        for (let i = 0; i < indicators.length; i++) {
            const id = this._getID(indicators[i])
            if (this.values[id] == null || this.values[id] == undefined) {
                return false
            }
        }
        return true

        // for (const i in indicators) {
        //     if (this.values[this._getID(i)] == null || this.values[this._getID(i)] == undefined) {
        //         return false;
        //     }
        // }
        // return true;
    }

}
