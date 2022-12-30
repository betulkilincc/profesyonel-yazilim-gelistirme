export default class Duration {
  constructor() { }
  static Second(seconds: number = 1): number {
    return seconds * 1000;
  }
  static Minute(minutes: number = 1): number {
    return minutes * 60 * 1000;
  }
  static Hour(hours: number = 1): number {
    return hours * 60 * 1000;
  }
  static Day(days: number = 1): number {
    return days * 24 * 60 * 60 * 1000;
  }
}
