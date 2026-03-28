import { Timestamp } from "firebase/firestore";

export type FeedMethod = "bottle" | "breast";
export type FeedType = "day" | "night";
export type NapType = "morning" | "afternoon";

export interface FeedRecord {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: Timestamp;
  type: FeedType;
  method: FeedMethod;
  amountOz: number;
  durationMin: number | null;
  feedNumber: number | null;
  notes: string | null;
}

export interface NapRecord {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: Timestamp;
  durationMin: number;
  napType: NapType;
  notes: string | null;
}

export interface DailySummary {
  date: string;
  dayFeedCount: number;
  dayFeedIntervals: number[];
  nightFeedCount: number;
  nightTotalOz: number;
  longestNightStretch: number;
  morningNapMin: number;
  afternoonNapMin: number;
  totalDailyOz: number;
}

export interface AppSettings {
  babyName: string;
  startDate: string; // YYYY-MM-DD
  currentIntervalMin: number;
  dailyOzMinimum: number;
}
