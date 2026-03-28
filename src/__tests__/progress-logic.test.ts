import {
  detectNightMilestones,
  napMeetsTarget,
  shouldSuggestIntervalAdvance,
  computeAverageInterval,
} from "@/lib/calculations";
import { Timestamp } from "firebase/firestore";
import type { FeedRecord } from "@/lib/types";

function ts(h: number, m: number = 0, date: string = "2026-03-28"): Timestamp {
  const [y, mo, d] = date.split("-").map(Number);
  return Timestamp.fromDate(new Date(y, mo - 1, d, h, m));
}

function makeFeed(
  hour: number,
  oz: number,
  date: string = "2026-03-28"
): FeedRecord {
  return {
    id: `f-${date}-${hour}`,
    date,
    startTime: ts(hour, 0, date),
    type: "day",
    method: "bottle",
    amountOz: oz,
    durationMin: null,
    feedNumber: null,
    notes: null,
  };
}

describe("detectNightMilestones — edge cases", () => {
  it("returns empty array for empty input", () => {
    expect(detectNightMilestones([])).toEqual([]);
  });

  it("returns empty array when all nights have multiple feeds", () => {
    const summaries = [
      { date: "2026-03-25", feedCount: 3, longestStretch: 180 },
      { date: "2026-03-26", feedCount: 2, longestStretch: 200 },
      { date: "2026-03-27", feedCount: 4, longestStretch: 150 },
    ];
    const ms = detectNightMilestones(summaries);
    expect(ms.filter((m) => m.type === "first-one-feed").length).toBe(0);
    expect(ms.filter((m) => m.type === "first-zero-feed").length).toBe(0);
  });

  it("only reports first 1-feed night once", () => {
    const summaries = [
      { date: "2026-03-25", feedCount: 2, longestStretch: 200 },
      { date: "2026-03-26", feedCount: 1, longestStretch: 400 },
      { date: "2026-03-27", feedCount: 1, longestStretch: 420 },
    ];
    const ms = detectNightMilestones(summaries);
    const oneFeedMilestones = ms.filter((m) => m.type === "first-one-feed");
    expect(oneFeedMilestones.length).toBe(1);
    expect(oneFeedMilestones[0].date).toBe("2026-03-26");
  });

  it("only reports first 0-feed night once", () => {
    const summaries = [
      { date: "2026-03-25", feedCount: 0, longestStretch: 720 },
      { date: "2026-03-26", feedCount: 0, longestStretch: 720 },
    ];
    const ms = detectNightMilestones(summaries);
    const zeroFeedMilestones = ms.filter((m) => m.type === "first-zero-feed");
    expect(zeroFeedMilestones.length).toBe(1);
  });

  it("detects all stretch thresholds (6h, 8h, 10h, 12h)", () => {
    const summaries = [
      { date: "2026-03-24", feedCount: 3, longestStretch: 120 },
      { date: "2026-03-25", feedCount: 2, longestStretch: 360 }, // 6h
      { date: "2026-03-26", feedCount: 1, longestStretch: 480 }, // 8h
      { date: "2026-03-27", feedCount: 1, longestStretch: 600 }, // 10h
      { date: "2026-03-28", feedCount: 0, longestStretch: 720 }, // 12h
    ];
    const ms = detectNightMilestones(summaries);
    const stretches = ms.filter((m) => m.type === "stretch-record");
    expect(stretches.length).toBe(4);
    expect(stretches.map((s) => s.value)).toEqual([360, 480, 600, 720]);
  });

  it("does not double-count stretch thresholds", () => {
    const summaries = [
      { date: "2026-03-25", feedCount: 2, longestStretch: 370 }, // crosses 360
      { date: "2026-03-26", feedCount: 2, longestStretch: 380 }, // also over 360
    ];
    const ms = detectNightMilestones(summaries);
    const stretches = ms.filter((m) => m.type === "stretch-record");
    expect(stretches.length).toBe(1);
  });
});

describe("napMeetsTarget — boundary values", () => {
  it("morning: exactly 59 min does not meet target", () => {
    expect(napMeetsTarget("morning", 59)).toBe(false);
  });
  it("morning: 61 min meets target", () => {
    expect(napMeetsTarget("morning", 61)).toBe(true);
  });
  it("afternoon: exactly 119 min does not meet target", () => {
    expect(napMeetsTarget("afternoon", 119)).toBe(false);
  });
  it("afternoon: 121 min meets target", () => {
    expect(napMeetsTarget("afternoon", 121)).toBe(true);
  });
  it("0 min does not meet any target", () => {
    expect(napMeetsTarget("morning", 0)).toBe(false);
    expect(napMeetsTarget("afternoon", 0)).toBe(false);
  });
});

describe("shouldSuggestIntervalAdvance — progression scenarios", () => {
  it("suggests when last 2 days within ±10min of goal", () => {
    expect(shouldSuggestIntervalAdvance([175, 185], 180)).toBe(true);
  });

  it("does not suggest when one day is off", () => {
    expect(shouldSuggestIntervalAdvance([165, 180], 180)).toBe(false);
  });

  it("does not suggest with empty array", () => {
    expect(shouldSuggestIntervalAdvance([], 180)).toBe(false);
  });

  it("checks only last 2 regardless of history length", () => {
    expect(shouldSuggestIntervalAdvance([150, 160, 178, 182], 180)).toBe(true);
  });

  it("works at each step boundary", () => {
    expect(shouldSuggestIntervalAdvance([193, 197], 195)).toBe(true);
    expect(shouldSuggestIntervalAdvance([208, 212], 210)).toBe(true);
    expect(shouldSuggestIntervalAdvance([223, 227], 225)).toBe(true);
  });
});

describe("computeAverageInterval — multi-day progress", () => {
  it("increasing intervals show progression", () => {
    // Day 1: 3h intervals
    const day1Feeds = [
      makeFeed(8, 6, "2026-03-26"),
      makeFeed(11, 6, "2026-03-26"),
      makeFeed(14, 6, "2026-03-26"),
      makeFeed(17, 6, "2026-03-26"),
    ];
    // Day 2: 3.5h intervals
    const day2Feeds = [
      makeFeed(8, 6, "2026-03-27"),
      { ...makeFeed(11, 6, "2026-03-27"), startTime: ts(11, 30, "2026-03-27") },
      makeFeed(15, 6, "2026-03-27"),
      { ...makeFeed(18, 6, "2026-03-27"), startTime: ts(18, 30, "2026-03-27") },
    ];

    const avg1 = computeAverageInterval(day1Feeds);
    const avg2 = computeAverageInterval(day2Feeds);
    expect(avg1).toBe(180);
    expect(avg2!).toBeGreaterThan(avg1!);
  });
});
