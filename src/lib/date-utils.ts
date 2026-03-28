import { Timestamp } from "firebase/firestore";
import { DAY_START_HOUR, NIGHT_START_HOUR } from "./constants";
import type { FeedType, NapType } from "./types";

export function isNightTime(date: Date): boolean {
  const h = date.getHours();
  return h >= NIGHT_START_HOUR || h < DAY_START_HOUR;
}

export function getFeedType(date: Date): FeedType {
  return isNightTime(date) ? "night" : "day";
}

export function inferNapType(napStart: Date, feed1End?: Date, feed2End?: Date): NapType {
  if (!feed1End || !feed2End) return "morning";
  return napStart >= feed2End ? "afternoon" : "morning";
}

export function getDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Returns the night window: 8 PM of prevDate to 8 AM of nextDate */
export function getNightDateRange(dateStr: string): { start: Date; end: Date } {
  const date = parseDate(dateStr);
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);

  const start = new Date(prevDay);
  start.setHours(NIGHT_START_HOUR, 0, 0, 0);

  const end = new Date(date);
  end.setHours(DAY_START_HOUR, 0, 0, 0);

  return { start, end };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function minutesBetween(a: Date, b: Date): number {
  return Math.abs(b.getTime() - a.getTime()) / 60000;
}

export function toTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

export function fromTimestamp(ts: Timestamp): Date {
  return ts.toDate();
}

export function todayString(): string {
  return getDateString(new Date());
}

export function getNightLabel(dateStr: string): string {
  const date = parseDate(dateStr);
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Night of ${fmt(prevDay)}–${fmt(date)}`;
}
