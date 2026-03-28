"use client";

import Header from "@/components/layout/Header";
import NapList from "@/components/nap/NapList";
import { useNaps } from "@/hooks/useNaps";
import { todayString } from "@/lib/date-utils";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NapPage() {
  const dateStr = todayString();
  const { naps, loading } = useNaps(dateStr);

  return (
    <>
      <Header title="Naps" />
      <div className="mx-auto max-w-lg space-y-4 p-4 pb-28">
        {loading ? (
          <p className="text-sm text-slate-blue-400">Loading...</p>
        ) : (
          <>
            <Link href="/log/nap">
              <Button variant="secondary" className="w-full">Log New Nap</Button>
            </Link>

            {naps.length > 0 && <NapList naps={naps} title="Today's Naps" />}

            {naps.length === 0 && (
              <div className="rounded-2xl bg-white p-6 text-center shadow-[var(--shadow-card)]">
                <p className="text-slate-blue-400">No naps logged today</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
