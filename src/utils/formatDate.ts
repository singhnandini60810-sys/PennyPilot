export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const parsedDate =
    typeof date === "string"
      ? new Date(`${date}T00:00:00`)
      : date;

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    options ?? {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(parsedDate);
}