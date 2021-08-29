import { DomainUtils } from '../../base/Domain.Utils';
export class DomainDataStoreUtils extends DomainUtils {
  roundTime(time: number, minutes: number): number {
    const coeff = 1000 * 60 * minutes;
    return Math.round(time / coeff) * coeff;
  }
}
const domainDataStoreUtils = new DomainDataStoreUtils();
export default domainDataStoreUtils
