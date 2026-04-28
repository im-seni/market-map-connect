/**
 * Returns current date-time represented in Korea Standard Time (UTC+9).
 * Uses Intl timezone conversion to avoid client locale offsets.
 */
export function getNowInKst(base: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(base);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  return new Date(
    pick("year"),
    Math.max(0, pick("month") - 1),
    pick("day"),
    pick("hour"),
    pick("minute"),
    pick("second"),
  );
}

