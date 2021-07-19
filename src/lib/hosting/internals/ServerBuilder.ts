
import { CanellationToken } from "../interfaces";
import { constants } from "../../interfaces";
import { BackgroundService } from "./BackgroundService";

export const serviceNames = constants.ServiceNames;

export class SimpleTask extends BackgroundService {


    protected override run(token: CanellationToken): Promise<void> {
        (token)
        throw new Error("Method not implemented.");
    }


}

