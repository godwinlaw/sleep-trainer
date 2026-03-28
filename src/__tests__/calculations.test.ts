import { Timestamp } from "firebase/firestore";
import type { FeedRecord, NapRecord } from "@/lib/types";
import {
  computeFeedIntervals,
  computeAverageInterval,
  computeTotalOz,
  computeLongestNightStretch,
  computeDailySummary,
  getOzWarningLevel,
  shouldSuggestIntervalAdvance,
  getNapWarning,
  detectNightMilestones,
  napMeetsTarget,
} from "@/lib/calculations";

function ts(h: number, m: number = 0, date: string = "2026-03-28"): Timestamp {
  const [y, mo, d] = date.split("-").map(Number);
  return Timestamp.fromDate(new Date(y, mo - 1, d, h, m));
}

function makeFeed(
  hour: number,
  oz: number,
  type: "day" | "night" = "day",
  opts?: Partial<FeedRecord>
): FeedRecord {
  return {
    id: `f-${hour}`,
    date: "2026-03-28",
    startTime: ts(hour),
    type,
    method: "bottle",
    amountOz: oz,
    durationMin: null,
    feedNumber: null,
    notes: null,
    ...opts,
  };
}

describe("computeFeedIntervals", () => {
  it("computes intervals between feeds", () => {
    const feeds = [makeFeed(8, 6), makeFeed(11, 6), makeFeed(14, 6), makeFeed(17, 6)];
    expect(computeFeedIntervals(feeds)).toEqual([180, 180, 180]);
  });

  it("handles single feed", () => {
    expect(computeFeedIntervals([makeFeed(8, 6)])).toEqual([]);
  });

  it("handles empty array", () => {
    expect(computeFeedIntervals([])).toEqual([]);
  });
});

describe("computeAverageInterval", () => {
  it("computes average", () => {
    const feeds = [
      makeFeed(8, 6),
      makeFeed(11, 6),
      { ...makeFeed(14, 6), startTime: ts(14, 30) },
    ];
    const avg = computeAverageInterval(feeds);
    // 8:00->11:00 = 180, 11:00->14:30 = 210, avg = 195
    expect(avg).toBeCloseTo(195);
  });

  it("returns null for single feed", () => {
    expect(computeAverageInterval([makeFeed(8, 6)])).toBeNull();
  });
});

describe("computeTotalOz", () => {
  it("sums ounces", () => {
    const feeds = [makeFeed(8, 6.5), makeFeed(11, 7), makeFeed(14, 5.5)];
    expect(computeTotalOz(feeds)).toBe(19);
  });

  it("returns 0 for empty", () => {
    expect(computeTotalOz([])).toBe(0);
  });
});

describe("computeLongestNightStretch", () => {
  it("returns 720 for no night feeds", () => {
    expect(computeLongestNightStretch([], "2026-03-28")).toBe(720);
  });

  it("computes correctly with one feed", () => {
    const feeds = [makeFeed(2, 3, "night")];
    const stretch = computeLongestNightStretch(feeds, "2026-03-28");
    // 8PM to 2AM = 360 min, 2AM to 8AM = 360 min -> max 360
    expect(stretch).toBe(360);
  });

  it("computes correctly with two feeds", () => {
    const feeds = [makeFeed(1, 3, "night"), makeFeed(4, 3, "night")];
    const stretch = computeLongestNightStretch(feeds, "2026-03-28");
    // 8PM to 1AM = 300, 1AM to 4AM = 180, 4AM to 8AM = 240 -> max 300
    expect(stretch).toBe(300);
  });
});

describe("computeDailySummary", () => {
  it("computes full summary", () => {
    const dayFeeds = [makeFeed(8, 7), makeFeed(11, 7), makeFeed(14, 6), makeFeed(17, 6)];
    const nightFeeds = [makeFeed(2, 3, "night")];
    const naps: NapRecord[] = [
      {
        id: "n1",
        date: "2026-03-28",
        startTime: ts(9, 30),
        durationMin: 60,
        napType: "morning",
        notes: null,
      },
      {
        id: "n2",
        date: "2026-03-28",
        startTime: ts(12, 30),
        durationMin: 120,
        napType: "afternoon",
        notes: null,
      },
    ];

    const summary = computeDailySummary(dayFeeds, nightFeeds, naps, "2026-03-28");
    expect(summary.dayFeedCount).toBe(4);
    expect(summary.nightFeedCount).toBe(1);
    expect(summary.nightTotalOz).toBe(3);
    expect(summary.totalDailyOz).toBe(29);
    expect(summary.morningNapMin).toBe(60);
    expect(summary.afternoonNapMin).toBe(120);
    expect(summary.dayFeedIntervals).toEqual([180, 180, 180]);
  });
});

describe("getOzWarningLevel", () => {
  it("returns ok when at or above minimum", () => {
    expect(getOzWarningLevel(24)).toBe("ok");
    expect(getOzWarningLevel(30)).toBe("ok");
  });
  it("returns caution between CAUTION_OZ and minimum", () => {
    expect(getOzWarningLevel(20)).toBe("caution");
    expect(getOzWarningLevel(16)).toBe("caution");
  });
  it("returns danger below CAUTION_OZ", () => {
    expect(getOzWarningLevel(15)).toBe("danger");
    expect(getOzWarningLevel(0)).toBe("danger");
  });
  it("respects custom minimum", () => {
    expect(getOzWarningLevel(20, 20)).toBe("ok");
  });
});

describe("shouldSuggestIntervalAdvance", () => {
  it("returns true after 2 consecutive on-target days", () => {
    expect(shouldSuggestIntervalAdvance([185, 182], 180)).toBe(true);
  });
  it("returns false with only 1 day", () => {
    expect(shouldSuggestIntervalAdvance([180], 180)).toBe(false);
  });
  it("returns false when off target", () => {
    expect(shouldSuggestIntervalAdvance([180, 150], 180)).toBe(false);
  });
});

describe("getNapWarning", () => {
  it("returns null with fewer than 3 feeds", () => {
    const feeds = [makeFeed(8, 6), makeFeed(11, 6)];
    expect(getNapWarning(new Date(2026, 2, 28, 13, 0), feeds)).toBeNull();
  });
  it("returns null for nap before feed 3", () => {
    const feeds = [makeFeed(8, 6), makeFeed(11, 6), makeFeed(14, 6)];
    expect(getNapWarning(new Date(2026, 2, 28, 12, 0), feeds)).toBeNull();
  });
  it("returns warning for nap after feed 3", () => {
    const feeds = [makeFeed(8, 6), makeFeed(11, 6), makeFeed(14, 6)];
    expect(getNapWarning(new Date(2026, 2, 28, 15, 0), feeds)).toContain("3rd feed");
  });
});

describe("detectNightMilestones", () => {
  it("detects first 1-feed night", () => {
    const summaries = [
      { date: "2026-03-25", feedCount: 3, longestStretch: 200 },
      { date: "2026-03-26", feedCount: 2, longestStretch: 300 },
      { date: "2026-03-27", feedCount: 1, longestStretch: 400 },
    ];
    const ms = detectNightMilestones(summaries);
    expect(ms.some((m) => m.type === "first-one-feed")).toBe(true);
  });

  it("detects first 0-feed night", () => {
    const summaries = [
      { date: "2026-03-25", feedCount: 1, longestStretch: 400 },
      { date: "2026-03-26", feedCount: 0, longestStretch: 720 },
    ];
    const ms = detectNightMilestones(summaries);
    expect(ms.some((m) => m.type === "first-zero-feed")).toBe(true);
  });

  it("detects stretch milestones", () => {
    const summaries = [
      { date: "2026-03-25", feedCount: 2, longestStretch: 200 },
      { date: "2026-03-26", feedCount: 1, longestStretch: 400 },
      { date: "2026-03-27", feedCount: 0, longestStretch: 720 },
    ];
    const ms = detectNightMilestones(summaries);
    const stretches = ms.filter((m) => m.type === "stretch-record");
    expect(stretches.length).toBeGreaterThanOrEqual(2);
  });
});

describe("napMeetsTarget", () => {
  it("morning: 60 min meets target", () => {
    expect(napMeetsTarget("morning", 60)).toBe(true);
  });
  it("morning: 45 min does not meet target", () => {
    expect(napMeetsTarget("morning", 45)).toBe(false);
  });
  it("afternoon: 120 min meets target", () => {
    expect(napMeetsTarget("afternoon", 120)).toBe(true);
  });
  it("afternoon: 90 min does not meet target", () => {
    expect(napMeetsTarget("afternoon", 90)).toBe(false);
  });
});
