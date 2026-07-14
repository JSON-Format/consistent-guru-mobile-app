import { formatInTimeZone } from "date-fns-tz";

export const getLocalDate = (
  date: Date = new Date()
): string => {
  const timezone =
    Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone;

  return formatInTimeZone(
    date,
    timezone,
    "yyyy-MM-dd"
  );
};