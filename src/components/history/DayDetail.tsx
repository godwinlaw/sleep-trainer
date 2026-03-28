"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import NightSummary from "@/components/today/NightSummary";
import NapSummary from "@/components/today/NapSummary";
import OzCounter from "@/components/today/OzCounter";
import Timeline from "@/components/today/Timeline";
import FeedList from "@/components/feed/FeedList";
import NapList from "@/components/nap/NapList";
import { useDailySummary } from "@/hooks/useDailySummary";
import { useSettings } from "@/hooks/useSettings";
import { fromTimestamp } from "@/lib/date-utils";

interface DayDetailProps {
  dateStr: string;
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function DayDetail({ dateStr }: DayDetailProps) {
  const { summary, dayFeeds, nightFeeds, naps, morningNap, afternoonNap, loading } =
    useDailySummary(dateStr);
  const { settings } = useSettings();

  const nextTargetTime = useMemo(() => {
    if (dayFeeds.length === 0 || dayFeeds.length >= 4) return null;
    const lastFeed = dayFeeds[dayFeeds.length - 1];
    const lastTime = fromTimestamp(lastFeed.startTime);
    return new Date(lastTime.getTime() + settings.currentIntervalMin * 60000);
  }, [dayFeeds, settings.currentIntervalMin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-slate-blue-400">Loading...</p>
      </div>
    );
  }

  const isEmpty = dayFeeds.length === 0 && nightFeeds.length === 0 && naps.length === 0;

  if (isEmpty) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-[var(--shadow-card)]">
        <p className="text-slate-blue-400">No entries for this day</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      variants={stagger}
      initial="hidden"
      animate="show"
      key={dateStr}
    >
      <motion.div variants={item}>
        <OzCounter
          totalOz={summary?.totalDailyOz ?? 0}
          dailyMinimum={settings.dailyOzMinimum}
          dayFeedCount={summary?.dayFeedCount ?? 0}
        />
      </motion.div>

      <motion.div variants={item}>
        <Timeline dayFeeds={dayFeeds} naps={naps} nextTargetTime={nextTargetTime} />
      </motion.div>

      <motion.div variants={item}>
        <NightSummary nightFeeds={nightFeeds} dateStr={dateStr} />
      </motion.div>

      <motion.div variants={item}>
        <NapSummary morningNap={morningNap} afternoonNap={afternoonNap} />
      </motion.div>

      {dayFeeds.length > 0 && (
        <motion.div variants={item}>
          <FeedList feeds={dayFeeds} title="Day Feeds" />
        </motion.div>
      )}

      {nightFeeds.length > 0 && (
        <motion.div variants={item}>
          <FeedList feeds={nightFeeds} title="Night Feeds" />
        </motion.div>
      )}

      {naps.length > 0 && (
        <motion.div variants={item}>
          <NapList naps={naps} title="Naps" />
        </motion.div>
      )}
    </motion.div>
  );
}
