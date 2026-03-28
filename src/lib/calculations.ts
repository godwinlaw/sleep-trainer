import type { FeedRecord, NapRecord, DailySummary } from "./types";
import { fromTimestamp, minutesBetween } from "./date-utils";
import {
  MIN_DAILY_OZ,
  CAUTION_OZ,
  NIGHT_START_HOUR,
  DAY_START_HOUR,
  MORNING_NAP_TARGET_MIN,
  AFTERNOON_NAP_TARGET_MIN,
} from "./constants";

export function computeFeedIntervals(dayFeeds: FeedRecord[]): number[] {
  const sorted = [...dayFeeds].sort(
    (a, b) => fromTimestamp(a.startTime).getTime() - fromTimestamp(b.startTime).getTime()
  );
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(
      minutesBetween(fromTimestamp(sorted[i - 1].startTime), fromTimestamp(sorted[i].startTime))
    );
  }
  return intervals;
}

export function computeAverageInterval(dayFeeds: FeedRecord[]): number | null {
  const intervals = computeFeedIntervals(dayFeeds);
  if (intervals.length === 0) return null;
  return intervals.reduce((s, v) => s + v, 0) / intervals.length;
}

export function computeTotalOz(feeds: FeedRecord[]): number {
  return Math.round(feeds.reduce((s, f) => s + f.amountOz, 0) * 10) / 10;
}

export function computeLongestNightStretch(nightFeeds: FeedRecord[], dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const prevDay = new Date(y, m - 1, d);
  prevDay.setDate(prevDay.getDate() - 1);
  const nightStart = new Date(prevDay);
  nightStart.setHours(NIGHT_START_HOUR, 0, 0, 0);
  const nightEnd = new Date(y, m - 1, d, DAY_START_HOUR, 0, 0, 0);

  if (nightFeeds.length === 0) {
    return minutesBetween(nightStart, nightEnd);
  }

  const sorted = [...nightFeeds].sort(
    (a, b) => fromTimestamp(a.startTime).getTime() - fromTimestamp(b.startTime).getTime()
  );

  const times = [
    nightStart,
    ...sorted.map((f) => fromTimestamp(f.startTime)),
    nightEnd,
  ];

  let longest = 0;
  for (let i = 1; i < times.length; i++) {
    const gap = minutesBetween(times[i - 1], times[i]);
    if (gap > longest) longest = gap;
  }
  return longest;
}

export function computeDailySummary(
  dayFeeds: FeedRecord[],
  nightFeeds: FeedRecord[],
  naps: NapRecord[],
  dateStr: string
): DailySummary {
  const morningNap = naps.find((n) => n.napType === "morning");
  const afternoonNap = naps.find((n) => n.napType === "afternoon");
  const allFeeds = [...dayFeeds, ...nightFeeds];

  return {
    date: dateStr,
    dayFeedCount: dayFeeds.length,
    dayFeedIntervals: computeFeedIntervals(dayFeeds),
    nightFeedCount: nightFeeds.length,
    nightTotalOz: computeTotalOz(nightFeeds),
    longestNightStretch: computeLongestNightStretch(nightFeeds, dateStr),
    morningNapMin: morningNap?.durationMin ?? 0,
    afternoonNapMin: afternoonNap?.durationMin ?? 0,
    totalDailyOz: computeTotalOz(allFeeds),
  };
}

export type OzWarningLevel = "ok" | "caution" | "danger";

export function getOzWarningLevel(totalOz: number, minOz: number = MIN_DAILY_OZ): OzWarningLevel {
  if (totalOz >= minOz) return "ok";
  if (totalOz >= CAUTION_OZ) return "caution";
  return "danger";
}

export function shouldSuggestIntervalAdvance(
  recentAvgIntervals: number[],
  currentGoalMin: number
): boolean {
  if (recentAvgIntervals.length < 2) return false;
  const last2 = recentAvgIntervals.slice(-2);
  return last2.every((avg) => Math.abs(avg - currentGoalMin) <= 10);
}

export function getNapWarning(
  napStart: Date,
  dayFeeds: FeedRecord[]
): string | null {
  const sorted = [...dayFeeds].sort(
    (a, b) => fromTimestamp(a.startTime).getTime() - fromTimestamp(b.startTime).getTime()
  );
  if (sorted.length < 3) return null;
  const feed3Time = fromTimestamp(sorted[2].startTime);
  if (napStart > feed3Time) {
    return "This nap falls after the 3rd feed — the methodology recommends naps only between feeds 1–2 and 2–3.";
  }
  return null;
}

export interface NightMilestone {
  type: "first-one-feed" | "first-zero-feed" | "stretch-record";
  label: string;
  date: string;
  value?: number;
}

export function detectNightMilestones(
  nightSummaries: { date: string; feedCount: number; longestStretch: number }[]
): NightMilestone[] {
  const milestones: NightMilestone[] = [];
  let foundOneFeed = false;
  let foundZeroFeed = false;
  const stretchThresholds = [360, 480, 600, 720];
  const stretchHit = new Set<number>();

  for (const s of nightSummaries) {
    if (!foundOneFeed && s.feedCount <= 1 && s.feedCount >= 0) {
      if (s.feedCount === 1) {
        foundOneFeed = true;
        milestones.push({
          type: "first-one-feed",
          label: "First night with only 1 feed!",
          date: s.date,
        });
      }
    }
    if (!foundZeroFeed && s.feedCount === 0) {
      foundZeroFeed = true;
      milestones.push({
        type: "first-zero-feed",
        label: "First night with no feeds!",
        date: s.date,
      });
    }
    for (const threshold of stretchThresholds) {
      if (!stretchHit.has(threshold) && s.longestStretch >= threshold) {
        stretchHit.add(threshold);
        const hours = threshold / 60;
        milestones.push({
          type: "stretch-record",
          label: `Longest stretch: ${hours} hours!`,
          date: s.date,
          value: threshold,
        });
      }
    }
  }
  return milestones;
}

export function napMeetsTarget(napType: "morning" | "afternoon", durationMin: number): boolean {
  const target = napType === "morning" ? MORNING_NAP_TARGET_MIN : AFTERNOON_NAP_TARGET_MIN;
  return durationMin >= target;
}
