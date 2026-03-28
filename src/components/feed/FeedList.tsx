"use client";

import { useRouter } from "next/navigation";
import FeedCard from "./FeedCard";
import type { FeedRecord } from "@/lib/types";

interface FeedListProps {
  feeds: FeedRecord[];
  title?: string;
}

export default function FeedList({ feeds, title }: FeedListProps) {
  const router = useRouter();

  if (feeds.length === 0) return null;

  return (
    <section>
      {title && <h3 className="mb-2 text-sm font-medium text-slate-blue-500">{title}</h3>}
      <div className="space-y-2">
        {feeds.map((feed, i) => (
          <FeedCard
            key={feed.id}
            feed={feed}
            index={i}
            onClick={() => router.push(`/log/feed?id=${feed.id}`)}
          />
        ))}
      </div>
    </section>
  );
}
