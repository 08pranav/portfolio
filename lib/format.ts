/** "2026-01-15" -> "Jan 2026" */
export const monthYear = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso)) : "";

export const pad = (n: number, width = 2) => String(n).padStart(width, "0");
