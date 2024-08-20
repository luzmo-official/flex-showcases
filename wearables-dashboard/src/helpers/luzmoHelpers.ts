export function datetimeLevelToNumber(datetimeLevel: string): number {
  switch (datetimeLevel) {
    case "year":
      return 1;
    case "quarter":
      return 2;
    case "month":
      return 3;
    case "week":
      return 4;
    case "day":
      return 5;
    case "hour":
      return 6;
    case "minute":
      return 7;
    case "second":
      return 8;
    default:
      return 9;
  }
}
