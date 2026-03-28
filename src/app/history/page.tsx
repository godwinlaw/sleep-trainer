"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import Header from "@/components/layout/Header";
import CalendarPicker from "@/components/history/CalendarPicker";
import DayDetail from "@/components/history/DayDetail";
import { getDateString, parseDate, todayString } from "@/lib/date-utils";

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateString(d);
}

function shiftDate(dateStr: string, delta: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + delta);
  return getDateString(d);
}

const SWIPE_THRESHOLD = 50;

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const deepLink = searchParams.get("date");
  const [selectedDate, setSelectedDate] = useState(deepLink || getYesterdayString());
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (deepLink) setSelectedDate(deepLink);
  }, [deepLink]);

  const today = todayString();

  const goToDate = useCallback((dateStr: string, dir: number) => {
    if (dateStr > today) return;
    setDirection(dir);
    setSelectedDate(dateStr);
  }, [today]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x > SWIPE_THRESHOLD) {
        goToDate(shiftDate(selectedDate, -1), -1);
      } else if (info.offset.x < -SWIPE_THRESHOLD) {
        goToDate(shiftDate(selectedDate, 1), 1);
      }
    },
    [selectedDate, goToDate]
  );

  const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <Header title="History" />
      <div className="mx-auto max-w-lg space-y-4 p-4 pb-28">
        <CalendarPicker selectedDate={selectedDate} onDateSelect={(d) => goToDate(d, 0)} />

        <div className="flex items-center justify-between">
          <button
            onClick={() => goToDate(shiftDate(selectedDate, -1), -1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-blue-500 hover:bg-slate-blue-50"
            aria-label="Previous day"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M10.354 3.646a.5.5 0 010 .708L6.707 8l3.647 3.646a.5.5 0 01-.708.708l-4-4a.5.5 0 010-.708l4-4a.5.5 0 01.708 0z" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-slate-blue-600">{dateLabel}</h2>
          <button
            onClick={() => goToDate(shiftDate(selectedDate, 1), 1)}
            disabled={selectedDate >= today}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-blue-500 hover:bg-slate-blue-50 disabled:opacity-30"
            aria-label="Next day"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M5.646 3.646a.5.5 0 01.708 0l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L9.293 8 5.646 4.354a.5.5 0 010-.708z" />
            </svg>
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ touchAction: "pan-y" }}
          >
            <DayDetail dateStr={selectedDate} />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
