import { computeBreastOz, assignFeedNumbers } from "@/lib/feeds";
import { Timestamp } from "firebase/firestore";
import type { FeedRecord } from "@/lib/types";

function ts(h: number, m: number = 0): Timestamp {
  return Timestamp.fromDate(new Date(2026, 2, 28, h, m));
}

function makeFeed(
  hour: number,
  type: "day" | "night",
  method: "bottle" | "breast" = "bottle"
): FeedRecord {
  return {
    id: `f-${hour}`,
    date: "2026-03-28",
    startTime: ts(hour),
    type,
    method,
    amountOz: method === "breast" ? computeBreastOz(30) : 6,
    durationMin: method === "breast" ? 30 : null,
    feedNumber: null,
    notes: null,
  };
}

describe("computeBreastOz", () => {
  it("calculates 0.1 oz per minute", () => {
    expect(computeBreastOz(30)).toBe(3);
  });
  it("rounds to 1 decimal", () => {
    expect(computeBreastOz(15)).toBe(1.5);
  });
  it("handles 0 minutes", () => {
    expect(computeBreastOz(0)).toBe(0);
  });
});

describe("assignFeedNumbers", () => {
  it("assigns numbers to day feeds only", () => {
    const feeds = [
      makeFeed(8, "day"),
      makeFeed(11, "day"),
      makeFeed(14, "day"),
      makeFeed(17, "day"),
    ];
    const result = assignFeedNumbers(feeds);
    expect(result.map((f) => f.feedNumber)).toEqual([1, 2, 3, 4]);
  });

  it("skips night feeds", () => {
    const feeds = [
      makeFeed(2, "night"),
      makeFeed(8, "day"),
      makeFeed(11, "day"),
    ];
    const result = assignFeedNumbers(feeds);
    expect(result[0].feedNumber).toBeNull();
    expect(result[1].feedNumber).toBe(1);
    expect(result[2].feedNumber).toBe(2);
  });

  it("handles empty array", () => {
    expect(assignFeedNumbers([])).toEqual([]);
  });

  it("assigns 5 to a 5th day feed", () => {
    const feeds = [
      makeFeed(8, "day"),
      makeFeed(10, "day"),
      makeFeed(12, "day"),
      makeFeed(14, "day"),
      makeFeed(16, "day"),
    ];
    const result = assignFeedNumbers(feeds);
    expect(result[4].feedNumber).toBe(5);
  });
});
