"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Timeline from "@/components/today/Timeline";
import NextFeedTarget from "@/components/today/NextFeedTarget";
import NightSummary from "@/components/today/NightSummary";
import NapSummary from "@/components/today/NapSummary";
import OzCounter from "@/components/today/OzCounter";
import QuickActions from "@/components/today/QuickActions";
import FeedList from "@/components/feed/FeedList";
import NapList from "@/components/nap/NapList";
import { useDailySummary } from "@/hooks/useDailySummary";
import { useSettings } from "@/hooks/useSettings";
import { todayString, fromTimestamp } from "@/lib/date-utils";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function TodayPage() {
  const dateStr = todayString();
  const { summary, dayFeeds, nightFeeds, naps, morningNap, afternoonNap, loading } =
    useDailySummary(dateStr);
  const { settings } = useSettings();

  const nextTargetTime = useMemo(() => {
    if (dayFeeds.length === 0 || dayFeeds.length >= 4) return null;
    const lastFeed = dayFeeds[dayFeeds.length - 1];
    const lastTime = fromTimestamp(lastFeed.startTime);
    return new Date(lastTime.getTime() + settings.currentIntervalMin * 60000);
  }, [dayFeeds, settings.currentIntervalMin]);

  const settingsIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.2 12.2a1.4 1.4 0 00.28 1.54l.05.05a1.7 1.7 0 11-2.4 2.4l-.05-.05a1.4 1.4 0 00-1.54-.28 1.4 1.4 0 00-.84 1.28v.14a1.7 1.7 0 11-3.4 0v-.07a1.4 1.4 0 00-.92-1.28 1.4 1.4 0 00-1.54.28l-.05.05a1.7 1.7 0 11-2.4-2.4l.05-.05a1.4 1.4 0 00.28-1.54 1.4 1.4 0 00-1.28-.84H2.3a1.7 1.7 0 110-3.4h.07a1.4 1.4 0 001.28-.92 1.4 1.4 0 00-.28-1.54l-.05-.05a1.7 1.7 0 112.4-2.4l.05.05a1.4 1.4 0 001.54.28h.07a1.4 1.4 0 00.84-1.28V2.3a1.7 1.7 0 113.4 0v.07a1.4 1.4 0 00.84 1.28 1.4 1.4 0 001.54-.28l.05-.05a1.7 1.7 0 112.4 2.4l-.05.05a1.4 1.4 0 00-.28 1.54v.07a1.4 1.4 0 001.28.84h.14a1.7 1.7 0 110 3.4h-.07a1.4 1.4 0 00-1.28.84z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );

  if (loading) {
    return (
      <>
        <Header title="Today" rightHref="/settings" rightLabel="Settings" rightIcon={settingsIcon} />
        <div className="flex items-center justify-center p-12">
          <p className="text-sm text-slate-blue-400">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Today" rightHref="/settings" rightLabel="Settings" rightIcon={settingsIcon} />
      <motion.div
        className="mx-auto max-w-lg space-y-4 p-4 pb-36"
        variants={stagger}
        initial="hidden"
        animate="show"
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
          <NextFeedTarget dayFeeds={dayFeeds} intervalGoalMin={settings.currentIntervalMin} />
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

        {dayFeeds.length === 0 && nightFeeds.length === 0 && naps.length === 0 && (
          <motion.div variants={item} className="rounded-2xl bg-white p-6 text-center shadow-[var(--shadow-card)]">
            <p className="text-slate-blue-400">No entries yet today</p>
            <p className="mt-1 text-sm text-slate-blue-300">
              Tap &quot;Log Feed&quot; or &quot;Log Nap&quot; to get started
            </p>
          </motion.div>
        )}
      </motion.div>

      <QuickActions />
    </>
  );
}
