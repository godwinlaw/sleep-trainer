"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { getDateString } from "@/lib/date-utils";

interface CalendarPickerProps {
  selectedDate: string;
  onDateSelect: (dateStr: string) => void;
  datesWithData?: Set<string>;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells: { day: number; dateStr: string; inMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const dt = new Date(year, month - 1, d);
    cells.push({ day: d, dateStr: getDateString(dt), inMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    cells.push({ day: d, dateStr: getDateString(dt), inMonth: true });
  }

  // Next month leading days (fill to 42 cells for 6 rows, or minimum to complete last row)
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const dt = new Date(year, month + 1, d);
      cells.push({ day: d, dateStr: getDateString(dt), inMonth: false });
    }
  }

  return cells;
}

export default function CalendarPicker({ selectedDate, onDateSelect, datesWithData }: CalendarPickerProps) {
  const selected = selectedDate.split("-").map(Number);
  const [viewYear, setViewYear] = useState(selected[0]);
  const [viewMonth, setViewMonth] = useState(selected[1] - 1);
  const [direction, setDirection] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const todayStr = getDateString(new Date());
  const cells = getMonthDays(viewYear, viewMonth);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const navigate = useCallback((delta: number) => {
    setDirection(delta);
    setViewMonth((prev) => {
      let newMonth = prev + delta;
      let newYear = viewYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      setViewYear(newYear);
      return newMonth;
    });
  }, [viewYear]);

  const prevMonth = useCallback(() => navigate(-1), [navigate]);
  const nextMonth = useCallback(() => navigate(1), [navigate]);

  // Don't allow navigating into the future
  const now = new Date();
  const canGoNext = viewYear < now.getFullYear() || (viewYear === now.getFullYear() && viewMonth < now.getMonth());

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const inMonthCells = cells.filter((c) => c.inMonth);
      if (focusedIndex < 0) return;

      let newIndex = focusedIndex;
      switch (e.key) {
        case "ArrowRight":
          newIndex = Math.min(focusedIndex + 1, inMonthCells.length - 1);
          e.preventDefault();
          break;
        case "ArrowLeft":
          newIndex = Math.max(focusedIndex - 1, 0);
          e.preventDefault();
          break;
        case "ArrowDown":
          newIndex = Math.min(focusedIndex + 7, inMonthCells.length - 1);
          e.preventDefault();
          break;
        case "ArrowUp":
          newIndex = Math.max(focusedIndex - 7, 0);
          e.preventDefault();
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (inMonthCells[focusedIndex]) {
            const cell = inMonthCells[focusedIndex];
            if (cell.dateStr <= todayStr) {
              onDateSelect(cell.dateStr);
            }
          }
          return;
        default:
          return;
      }
      setFocusedIndex(newIndex);
    },
    [cells, focusedIndex, todayStr, onDateSelect]
  );

  // Focus the button when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && gridRef.current) {
      const buttons = gridRef.current.querySelectorAll<HTMLButtonElement>("button[data-in-month]");
      buttons[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]">
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" onClick={prevMonth} aria-label="Previous month">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M10.354 3.646a.5.5 0 010 .708L6.707 8l3.647 3.646a.5.5 0 01-.708.708l-4-4a.5.5 0 010-.708l4-4a.5.5 0 01.708 0z" />
          </svg>
        </Button>
        <h3 className="text-sm font-semibold text-slate-blue-700">{monthLabel}</h3>
        <Button variant="ghost" onClick={nextMonth} disabled={!canGoNext} aria-label="Next month">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M5.646 3.646a.5.5 0 01.708 0l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L9.293 8 5.646 4.354a.5.5 0 010-.708z" />
          </svg>
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1" role="row">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-blue-400" role="columnheader">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${viewYear}-${viewMonth}`}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.15 }}
          ref={gridRef}
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label={monthLabel}
          onKeyDown={handleKeyDown}
        >
          {cells.map((cell, idx) => {
            const isSelected = cell.dateStr === selectedDate;
            const isToday = cell.dateStr === todayStr;
            const isFuture = cell.dateStr > todayStr;
            const hasData = datesWithData?.has(cell.dateStr);

            return (
              <button
                key={idx}
                role="gridcell"
                aria-selected={isSelected}
                aria-label={`${cell.day}${isToday ? ", today" : ""}${isSelected ? ", selected" : ""}`}
                disabled={!cell.inMonth || isFuture}
                data-in-month={cell.inMonth ? "" : undefined}
                tabIndex={cell.inMonth && !isFuture ? (isSelected ? 0 : -1) : undefined}
                onFocus={() => {
                  if (cell.inMonth) {
                    const inMonthCells = cells.filter((c) => c.inMonth);
                    const i = inMonthCells.findIndex((c) => c.dateStr === cell.dateStr);
                    setFocusedIndex(i);
                  }
                }}
                onClick={() => {
                  if (cell.inMonth && !isFuture) onDateSelect(cell.dateStr);
                }}
                className={`
                  relative flex h-9 w-full items-center justify-center rounded-xl text-xs transition-colors
                  ${!cell.inMonth ? "text-slate-blue-200 cursor-default" : ""}
                  ${cell.inMonth && isFuture ? "text-slate-blue-200 cursor-default" : ""}
                  ${cell.inMonth && !isFuture && !isSelected ? "text-slate-blue-700 hover:bg-slate-blue-50 cursor-pointer" : ""}
                  ${isSelected ? "bg-slate-blue-500 text-white font-semibold" : ""}
                  ${isToday && !isSelected ? "font-semibold ring-1 ring-slate-blue-300" : ""}
                `}
              >
                {cell.day}
                {hasData && !isSelected && cell.inMonth && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-soft-teal-400" />
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
