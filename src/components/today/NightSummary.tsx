"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { FeedRecord } from "@/lib/types";
import { computeTotalOz, computeLongestNightStretch } from "@/lib/calculations";
import { formatDuration, formatTime, getNightLabel, fromTimestamp, minutesBetween } from "@/lib/date-utils";
import { NIGHT_START_HOUR } from "@/lib/constants";

interface NightSummaryProps {
  nightFeeds: FeedRecord[];
  dateStr: string;
}

export default function NightSummary({ nightFeeds, dateStr }: NightSummaryProps) {
  const totalOz = computeTotalOz(nightFeeds);
  const longestStretch = computeLongestNightStretch(nightFeeds, dateStr);
  const label = getNightLabel(dateStr);

  const feedsWithElapsed = useMemo(() => {
    if (nightFeeds.length === 0) return [];

    const [y, m, d] = dateStr.split("-").map(Number);
    const prevDay = new Date(y, m - 1, d);
    prevDay.setDate(prevDay.getDate() - 1);
    const nightStart = new Date(prevDay);
    nightStart.setHours(NIGHT_START_HOUR, 0, 0, 0);

    const sorted = [...nightFeeds].sort(
      (a, b) => fromTimestamp(a.startTime).getTime() - fromTimestamp(b.startTime).getTime()
    );

    return sorted.map((feed, i) => {
      const feedTime = fromTimestamp(feed.startTime);
      const prevTime = i === 0 ? nightStart : fromTimestamp(sorted[i - 1].startTime);
      const elapsed = minutesBetween(prevTime, feedTime);
      return { feed, feedTime, elapsed };
    });
  }, [nightFeeds, dateStr]);

  return (
    <Card>
      <h3 className="mb-2 text-sm font-medium text-slate-blue-500">{label}</h3>
      <div className="flex gap-4">
        <div>
          <p className="text-2xl font-semibold text-slate-blue-800">{nightFeeds.length}</p>
          <p className="text-xs text-slate-blue-400">feeds</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-blue-800">{totalOz}</p>
          <p className="text-xs text-slate-blue-400">oz</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-blue-800">{formatDuration(longestStretch)}</p>
          <p className="text-xs text-slate-blue-400">longest stretch</p>
        </div>
      </div>

      {feedsWithElapsed.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-slate-blue-100 pt-3">
          {feedsWithElapsed.map(({ feed, feedTime, elapsed }, i) => (
            <div key={feed.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-blue-600">
                {formatTime(feedTime)} · {feed.amountOz} oz
              </span>
              <span className="text-slate-blue-400">
                {formatDuration(elapsed)} after {i === 0 ? "8 PM" : "prev feed"}
              </span>
            </div>
          ))}
        </div>
      )}

      {nightFeeds.length === 0 && (
        <Badge variant="morning" className="mt-2">No night feeds!</Badge>
      )}
    </Card>
  );
}
