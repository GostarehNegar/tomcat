import { IMessageBus } from "../../bus";
import { IDataProvider } from "../data/_interfaces";

import { IStrategy } from "./IStrategy";
import { BaseStrategy, TestStrategy } from "./strategy";

export class StrategyFactory {
    public static getStrategy(name: string, bus: IMessageBus, dataProvider: IDataProvider): IStrategy {
        switch (name) {
            case "BaseStrategy":
                return new BaseStrategy(bus, dataProvider)
            case "TestStrategy":
                return new TestStrategy(bus, dataProvider)

            default:
                return new BaseStrategy(bus, dataProvider)
        }
    }
}