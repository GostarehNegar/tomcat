import { Utils } from '../../../base/Utils'
class UtilsEx extends Utils {

    roundTime(time: number, minutes: number): number {
        const coeff = 1000 * 60 * minutes;
        return Math.round(time / coeff) * coeff
    }
    //var roundToNearestMinute = function (date) {
    //     var coeff = 1000 * 60 * 1; // <-- Replace {5} with interval

    //     return new Date(Math.round(date.getTime() / coeff) * coeff);
    // };

}
export default new UtilsEx();