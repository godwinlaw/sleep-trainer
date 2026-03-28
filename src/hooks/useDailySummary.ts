"use client";

import { useMemo } from "react";
import type { DailySummary } from "@/lib/types";
import { useFeeds } from "./useFeeds";
import { useNaps } from "./useNaps";
import { computeDailySummary } from "@/lib/calculations";

interface UseDailySummaryResult {
  summary: DailySummary | null;
  dayFeeds: ReturnType<typeof useFeeds>["dayFeeds"];
  nightFeeds: ReturnType<typeof useFeeds>["nightFeeds"];
  allFeeds: ReturnType<typeof useFeeds>["allFeeds"];
  naps: ReturnType<typeof useNaps>["naps"];
  morningNap: ReturnType<typeof useNaps>["morningNap"];
  afternoonNap: ReturnType<typeof useNaps>["afternoonNap"];
  loading: boolean;
}

export function useDailySummary(dateStr: string): UseDailySummaryResult {
  const { dayFeeds, nightFeeds, allFeeds, loading: feedsLoading } = useFeeds(dateStr);
  const { naps, morningNap, afternoonNap, loading: napsLoading } = useNaps(dateStr);

  const summary = useMemo(() => {
    if (feedsLoading || napsLoading) return null;
    return computeDailySummary(dayFeeds, nightFeeds, naps, dateStr);
  }, [dayFeeds, nightFeeds, naps, dateStr, feedsLoading, napsLoading]);

  return {
    summary,
    dayFeeds,
    nightFeeds,
    allFeeds,
    naps,
    morningNap,
    afternoonNap,
    loading: feedsLoading || napsLoading,
  };
}
