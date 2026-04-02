"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FeedRecord, NapRecord } from "@/lib/types";
import {
  computeAverageInterval,
  computeTotalOz,
  computeLongestNightStretch,
  detectNightMilestones,
  napMeetsTarget,
  type NightMilestone,
} from "@/lib/calculations";
import { getDateString } from "@/lib/date-utils";

interface DayProgress {
  date: string;
  avgInterval: number | null;
  dayFeedCount: number;
  nightFeedCount: number;
  nightTotalOz: number;
  longestNightStretch: number;
  totalDailyOz: number;
  morningNapMet: boolean;
  afternoonNapMet: boolean;
}

interface UseProgressResult {
  days: DayProgress[];
  milestones: NightMilestone[];
  napConsistency: number;
  loading: boolean;
}

export function useProgress(numDays: number = 14): UseProgressResult {
  const [days, setDays] = useState<DayProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProgress() {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - numDays + 1);
      const startStr = getDateString(startDate);
      const endStr = getDateString(today);

      const dates: string[] = [];
      const d = new Date(startDate);
      while (d <= today) {
        dates.push(getDateString(d));
        d.setDate(d.getDate() + 1);
      }

      const [feedsSnap, napsSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "feeds"),
            where("date", ">=", startStr),
            where("date", "<=", endStr),
            orderBy("date"),
            orderBy("startTime", "asc")
          )
        ),
        getDocs(
          query(
            collection(db, "naps"),
            where("date", ">=", startStr),
            where("date", "<=", endStr),
            orderBy("date"),
            orderBy("startTime", "asc")
          )
        ),
      ]);
      const allFeeds = feedsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as FeedRecord[];
      const allNaps = napsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as NapRecord[];

      if (cancelled) return;

      const result: DayProgress[] = dates.map((dateStr) => {
        const dayFeeds = allFeeds.filter((f) => f.date === dateStr && f.type === "day");
        const nightFeeds = allFeeds.filter((f) => f.date === dateStr && f.type === "night");
        const naps = allNaps.filter((n) => n.date === dateStr);
        const morningNap = naps.find((n) => n.napType === "morning");
        const afternoonNap = naps.find((n) => n.napType === "afternoon");

        return {
          date: dateStr,
          avgInterval: computeAverageInterval(dayFeeds),
          dayFeedCount: dayFeeds.length,
          nightFeedCount: nightFeeds.length,
          nightTotalOz: computeTotalOz(nightFeeds),
          longestNightStretch: computeLongestNightStretch(nightFeeds, dateStr),
          totalDailyOz: computeTotalOz([...dayFeeds, ...nightFeeds]),
          morningNapMet: morningNap ? napMeetsTarget("morning", morningNap.durationMin) : false,
          afternoonNapMet: afternoonNap ? napMeetsTarget("afternoon", afternoonNap.durationMin) : false,
        };
      });

      setDays(result);
      setLoading(false);
    }

    fetchProgress();
    return () => { cancelled = true; };
  }, [numDays]);

  const milestones = useMemo(
    () =>
      detectNightMilestones(
        days.map((d) => ({
          date: d.date,
          feedCount: d.nightFeedCount,
          longestStretch: d.longestNightStretch,
        }))
      ),
    [days]
  );

  const napConsistency = useMemo(() => {
    if (days.length === 0) return 0;
    const bothNapsMet = days.filter((d) => d.morningNapMet && d.afternoonNapMet).length;
    return Math.round((bothNapsMet / days.length) * 100);
  }, [days]);

  return { days, milestones, napConsistency, loading };
}
