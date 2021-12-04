import { BaseServices } from "./infrastructure/base";

export class DomainServices extends BaseServices {
    public getDataSource() {

        return null;
    }
    static readonly Instance = new DomainServices();
}

export default DomainServices.Instance;