const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Office hours from the CMS text, e.g. "Mon – Sat, 9:00 – 19:00". Null when the text can't be read. */
export function parseHours(hours: string) {
  const m = hours.toLowerCase().match(/(sun|mon|tue|wed|thu|fri|sat)\w*\s*[–-]\s*(sun|mon|tue|wed|thu|fri|sat)\w*.*?(\d{1,2})[:.](\d{2})\s*[–-]\s*(\d{1,2})[:.](\d{2})/);
  if (!m) return null;
  return { from: DAYS.indexOf(m[1]), to: DAYS.indexOf(m[2]), opens: `${Number(m[3])}:${m[4]}`, closes: `${Number(m[5])}:${m[6]}`,
    openMin: Number(m[3]) * 60 + Number(m[4]), closeMin: Number(m[5]) * 60 + Number(m[6]) };
}

/** Whether the office is open right now (Dubai time). Null when the hours can't be read, so nothing is claimed. */
export function openNow(hours: string): boolean | null {
  const h = parseHours(hours);
  if (!h) return null;
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }));
  const d = now.getDay();
  const dayOk = h.from <= h.to ? d >= h.from && d <= h.to : d >= h.from || d <= h.to;
  const mins = now.getHours() * 60 + now.getMinutes();
  return dayOk && mins >= h.openMin && mins < h.closeMin;
}

/** Subscribe helper for useSyncExternalStore: re-check every minute. */
export const everyMinute = (cb: () => void) => { const t = window.setInterval(cb, 60_000); return () => window.clearInterval(t); };
