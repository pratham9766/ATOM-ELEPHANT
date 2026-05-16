export function relativeTime(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  const deltaSeconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1]
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, seconds] of units) {
    if (deltaSeconds >= seconds || unit === "second") {
      return formatter.format(-Math.floor(deltaSeconds / seconds), unit);
    }
  }
  return "just now";
}
