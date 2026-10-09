export const DAY_MS = 24 * 60 * 60 * 1000;

export const monthPeriod = (d: Date) => d.toISOString().slice(0, 7);
export const dayPeriod = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (d: Date, days: number) => new Date(d.getTime() + days * DAY_MS);
export const daysBetween = (from: Date, to: Date) => (to.getTime() - from.getTime()) / DAY_MS;
