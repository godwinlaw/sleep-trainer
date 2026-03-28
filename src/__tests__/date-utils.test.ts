import {
  isNightTime,
  getFeedType,
  getDateString,
  getNightDateRange,
  formatTime,
  formatDuration,
  minutesBetween,
  inferNapType,
  getNightLabel,
  parseDate,
} from "@/lib/date-utils";

describe("isNightTime", () => {
  it("returns true for 8 PM", () => {
    expect(isNightTime(new Date(2026, 2, 28, 20, 0))).toBe(true);
  });
  it("returns true for 11 PM", () => {
    expect(isNightTime(new Date(2026, 2, 28, 23, 0))).toBe(true);
  });
  it("returns true for 3 AM", () => {
    expect(isNightTime(new Date(2026, 2, 28, 3, 0))).toBe(true);
  });
  it("returns true for 7:59 AM", () => {
    expect(isNightTime(new Date(2026, 2, 28, 7, 59))).toBe(true);
  });
  it("returns false for 8 AM", () => {
    expect(isNightTime(new Date(2026, 2, 28, 8, 0))).toBe(false);
  });
  it("returns false for noon", () => {
    expect(isNightTime(new Date(2026, 2, 28, 12, 0))).toBe(false);
  });
  it("returns false for 7:59 PM", () => {
    expect(isNightTime(new Date(2026, 2, 28, 19, 59))).toBe(false);
  });
});

describe("getFeedType", () => {
  it("returns 'day' for daytime", () => {
    expect(getFeedType(new Date(2026, 2, 28, 10, 0))).toBe("day");
  });
  it("returns 'night' for nighttime", () => {
    expect(getFeedType(new Date(2026, 2, 28, 22, 0))).toBe("night");
  });
});

describe("getDateString", () => {
  it("formats to YYYY-MM-DD", () => {
    expect(getDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
  it("handles double digit months", () => {
    expect(getDateString(new Date(2026, 11, 25))).toBe("2026-12-25");
  });
});

describe("parseDate", () => {
  it("parses YYYY-MM-DD", () => {
    const d = parseDate("2026-03-15");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });
});

describe("getNightDateRange", () => {
  it("returns 8 PM previous day to 8 AM given day", () => {
    const { start, end } = getNightDateRange("2026-03-28");
    expect(start.getDate()).toBe(27);
    expect(start.getHours()).toBe(20);
    expect(end.getDate()).toBe(28);
    expect(end.getHours()).toBe(8);
  });
});

describe("formatTime", () => {
  it("formats to 12h with am/pm", () => {
    const result = formatTime(new Date(2026, 2, 28, 14, 30));
    expect(result).toMatch(/2:30\s*PM/i);
  });
});

describe("formatDuration", () => {
  it("formats minutes only", () => {
    expect(formatDuration(45)).toBe("45m");
  });
  it("formats hours only", () => {
    expect(formatDuration(120)).toBe("2h");
  });
  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
  });
});

describe("minutesBetween", () => {
  it("computes correct gap", () => {
    const a = new Date(2026, 2, 28, 8, 0);
    const b = new Date(2026, 2, 28, 11, 30);
    expect(minutesBetween(a, b)).toBe(210);
  });
  it("is always positive", () => {
    const a = new Date(2026, 2, 28, 11, 0);
    const b = new Date(2026, 2, 28, 8, 0);
    expect(minutesBetween(a, b)).toBe(180);
  });
});

describe("inferNapType", () => {
  it("returns morning when no feed times", () => {
    expect(inferNapType(new Date(2026, 2, 28, 10, 0))).toBe("morning");
  });
  it("returns morning before feed2", () => {
    const feed1 = new Date(2026, 2, 28, 8, 0);
    const feed2 = new Date(2026, 2, 28, 12, 0);
    expect(inferNapType(new Date(2026, 2, 28, 10, 0), feed1, feed2)).toBe("morning");
  });
  it("returns afternoon after feed2", () => {
    const feed1 = new Date(2026, 2, 28, 8, 0);
    const feed2 = new Date(2026, 2, 28, 12, 0);
    expect(inferNapType(new Date(2026, 2, 28, 13, 0), feed1, feed2)).toBe("afternoon");
  });
});

describe("getNightLabel", () => {
  it("formats night label", () => {
    const label = getNightLabel("2026-03-28");
    expect(label).toContain("Mar 27");
    expect(label).toContain("Mar 28");
  });
});
