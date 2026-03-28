"use client";

import Header from "@/components/layout/Header";
import FeedList from "@/components/feed/FeedList";
import { useFeeds } from "@/hooks/useFeeds";
import { todayString } from "@/lib/date-utils";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function FeedPage() {
  const dateStr = todayString();
  const { dayFeeds, nightFeeds, loading } = useFeeds(dateStr);

  return (
    <>
      <Header title="Feeds" />
      <div className="mx-auto max-w-lg space-y-4 p-4 pb-28">
        {loading ? (
          <p className="text-sm text-slate-blue-400">Loading...</p>
        ) : (
          <>
            <Link href="/log/feed">
              <Button className="w-full">Log New Feed</Button>
            </Link>

            {dayFeeds.length > 0 && <FeedList feeds={dayFeeds} title="Day Feeds" />}
            {nightFeeds.length > 0 && <FeedList feeds={nightFeeds} title="Night Feeds" />}

            {dayFeeds.length === 0 && nightFeeds.length === 0 && (
              <div className="rounded-2xl bg-white p-6 text-center shadow-[var(--shadow-card)]">
                <p className="text-slate-blue-400">No feeds logged today</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
