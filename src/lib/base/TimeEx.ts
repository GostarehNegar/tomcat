const isNumeric = (input) => {
  return !isNaN(parseFloat(input)) && isFinite(input);
};
const to2Digits = (n) => {
  if (n < 10) return '0' + n;
  return n;
};
// function parseIsoDate(v:string){
//   const d= new Date(v)

//   if (d.toISOString()==v)
//       return d.getTime();
// }

const msecPerSecond = 1000,
  msecPerMinute = 60000,
  msecPerHour = 3600000,
  msecPerDay = 86400000;
export type Ticks = number | Date | TimeEx
export class TimeEx {
  public ticks: number;
  constructor(_ticks?: Ticks|string) {
    this.ticks = TimeEx.toticks(_ticks)
    // _ticks = _ticks || Date.now();
    // this.ticks =
    //   typeof _ticks == 'number'
    //     ? _ticks
    //     : _ticks instanceof TimeEx
    //       ? (_ticks as TimeEx).ticks
    //       : (_ticks as Date).getTime();
  }
  public roundToMinutes(n: number): TimeEx {
    const coeff = 1000 * 60 * n;
    return new TimeEx(Math.round(this.ticks / coeff) * coeff);
  }
  public floorToMinutes(n: number): TimeEx {
    const coeff = 1000 * 60 * n;
    return new TimeEx(Math.floor(this.ticks / coeff) * coeff);
  }
  public toString() {
    return this.asDate.toUTCString();
  }
  public get asUTCDate() {
    return this.toString()
  }
  public get asDate() {
    return new Date(this.ticks);
  }
  static now = () => new TimeEx(Date.now());
  equals(other: TimeEx): boolean {
    return this.ticks === other.ticks;
  }
  subtract(other: number | Date | TimeEx) {
    return new TimeSpan(this.ticks - new TimeEx(other).ticks);
  }
  addMinutes(n: number) {
    return new TimeEx(this.ticks + n * 1000 * 60);
  }
  static parseIsoDate(input?:string){
    if(!input)
      return new Date();
    var result = new Date(input)
    return !isNaN(result.getTime()) && result.toISOString()==input
    ? result
    :null;
  }
  static toticks(input?: Date | number | TimeEx | string):number {
    if (!input)
      return new Date().getTime();
    if (input instanceof TimeEx) {
      return input.ticks
    }
    if (input instanceof Date) {
      return input.getTime()
    }
    if (typeof input=="string"){
      const d= new Date(input)
      if (!isNaN(d.getTime()) && d.toISOString()==input)
          return d.getTime();
      return parseInt(input)
    }
    return input
  }
  
}
export class TimeSpan {
  private msecs: number;
  constructor(milliseconds?, seconds?, minutes?, hours?, days?) {
    this.msecs = 0;
    if (isNumeric(days)) {
      this.msecs += days * msecPerDay;
    }
    if (isNumeric(hours)) {
      this.msecs += hours * msecPerHour;
    }
    if (isNumeric(minutes)) {
      this.msecs += minutes * msecPerMinute;
    }
    if (isNumeric(seconds)) {
      this.msecs += seconds * msecPerSecond;
    }
    if (isNumeric(milliseconds)) {
      this.msecs += milliseconds;
    }
  }
  get milliseconds() {
    return this.msecs % 1000;
  }
  get absSeconds() {
    return Math.abs(this.seconds);
  }
  get seconds() {
    return Math.floor(this.msecs / msecPerSecond) % 60;
  }
  get absMinutes() {
    return Math.abs(this.minutes);
  }
  get minutes() {
    return Math.floor(this.msecs / msecPerMinute) % 60;
  }
  get absHours() {
    return Math.abs(this.hours);
  }
  get hours() {
    return Math.floor(this.msecs / msecPerHour) % 24;
  }
  get days() {
    return Math.floor(this.msecs / msecPerDay);
  }
  get absTotalMilliseconds() {
    return Math.abs(this.totalMilliseconds);
  }

  get totalMilliseconds() {
    return this.msecs;
  }

  get absTotalSeconds() {
    return Math.abs(this.totalSeconds);
  }
  get totalSeconds() {
    return this.msecs / msecPerSecond;
  }
  get absTotalMinutes() {
    return Math.abs(this.totalMinutes);
  }
  get totalMinutes() {
    return this.msecs / msecPerMinute;
  }
  get absTotalHours() {
    return Math.abs(this.totalHours);
  }
  get totalHours() {
    return this.msecs / msecPerHour;
  }
  get totalDays() {
    return this.msecs / msecPerDay;
  }
  toString() {
    let text = '';
    let negative = false;
    if (this.msecs < 0) {
      negative = true;
      text += '-';
      this.msecs = Math.abs(this.msecs);
    }
    text +=
      to2Digits(Math.floor(this.totalHours)) + ':' + to2Digits(this.minutes);
    if (negative) this.msecs *= -1;
    return text;
  }

  addMilliseconds(milliseconds) {
    if (!isNumeric(milliseconds)) {
      return;
    }
    this.msecs += milliseconds;
  }
  addSeconds(seconds) {
    if (!isNumeric(seconds)) {
      return;
    }
    this.msecs += seconds * msecPerSecond;
  }
  addMinutes(minutes) {
    if (!isNumeric(minutes)) {
      return;
    }
    this.msecs += minutes * msecPerMinute;
  }
  addHours(hours) {
    if (!isNumeric(hours)) {
      return;
    }
    this.msecs += hours * msecPerHour;
  }
  addDays(days) {
    if (!isNumeric(days)) {
      return;
    }
    this.msecs += days * msecPerDay;
  }

  subtractMilliseconds(milliseconds) {
    if (!isNumeric(milliseconds)) {
      return;
    }
    this.msecs -= milliseconds;
  }
  subtractSeconds(seconds) {
    if (!isNumeric(seconds)) {
      return;
    }
    this.msecs -= seconds * msecPerSecond;
  }
  subtractMinutes(minutes) {
    if (!isNumeric(minutes)) {
      return;
    }
    this.msecs -= minutes * msecPerMinute;
  }
  subtractHours(hours) {
    if (!isNumeric(hours)) {
      return;
    }
    this.msecs -= hours * msecPerHour;
  }
  subtractDays(days) {
    if (!isNumeric(days)) {
      return;
    }
    this.msecs -= days * msecPerDay;
  }

  static FromSeconds(seconds) {
    return new TimeSpan(0, seconds, 0, 0, 0);
  }
  static FromMinutes(minutes) {
    return new TimeSpan(0, 0, minutes, 0, 0);
  }
  static FromHours(hours) {
    return new TimeSpan(0, 0, 0, hours, 0);
  }
  static FromDays(days) {
    return new TimeSpan(0, 0, 0, 0, days);
  }
  static FromDates(firstDate, secondDate, forcePositive) {
    let differenceMsecs = secondDate.valueOf() - firstDate.valueOf();
    if (forcePositive === true) {
      differenceMsecs = Math.abs(differenceMsecs);
    }
    return new TimeSpan(differenceMsecs, 0, 0, 0, 0);
  }
  static Parse(timespanText) {
    const tokens = timespanText.split(':');
    const days = tokens[0].split('.');
    if (days.length == 2)
      return new TimeSpan(0, tokens[2], tokens[1], days[1], days[0]);

    return new TimeSpan(0, tokens[2], tokens[1], tokens[0], 0);
  }
}
