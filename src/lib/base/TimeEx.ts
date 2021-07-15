const isNumeric = (input) => {
  return !isNaN(parseFloat(input)) && isFinite(input);
};
const to2Digits = (n) => {
  if (n < 10) return '0' + n;
  return n;
};

const msecPerSecond = 1000,
  msecPerMinute = 60000,
  msecPerHour = 3600000,
  msecPerDay = 86400000;
export class TimeEx {
  constructor(public ticks: number) {}

  public get asDate() {
    return new Date(this.ticks);
  }
  static now = () => new TimeEx(Date.now());
  equals(other: TimeEx): boolean {
    return this.ticks === other.ticks;
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
  get seconds() {
    return Math.floor(this.msecs / msecPerSecond) % 60;
  }
  get minutes() {
    return Math.floor(this.msecs / msecPerMinute) % 60;
  }
  get hours() {
    return Math.floor(this.msecs / msecPerHour) % 24;
  }
  get days() {
    return Math.floor(this.msecs / msecPerDay);
  }
  get totalMilliseconds() {
    return this.msecs;
  }
  get totalSeconds() {
    return this.msecs / msecPerSecond;
  }
  get totalMinutes() {
    return this.msecs / msecPerMinute;
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
