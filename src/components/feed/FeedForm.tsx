"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TimePicker from "@/components/ui/TimePicker";
import Badge from "@/components/ui/Badge";
import { addFeed, updateFeed, computeBreastOz } from "@/lib/feeds";
import { getFeedType, getDateString, fromTimestamp } from "@/lib/date-utils";
import { TARGET_DAY_FEEDS } from "@/lib/constants";
import type { FeedRecord } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FeedFormProps {
  editFeed?: FeedRecord | null;
  onSaved?: () => void;
}

function nowTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function nowDateStr(): string {
  return getDateString(new Date());
}

export default function FeedForm({ editFeed, onSaved }: FeedFormProps) {
  const [date, setDate] = useState(editFeed ? editFeed.date : nowDateStr());
  const [time, setTime] = useState(() => {
    if (editFeed) {
      const d = fromTimestamp(editFeed.startTime);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return nowTimeStr();
  });
  const [method, setMethod] = useState<"bottle" | "breast">(editFeed?.method ?? "bottle");
  const [amountOz, setAmountOz] = useState(editFeed?.amountOz?.toString() ?? "");
  const [durationMin, setDurationMin] = useState(editFeed?.durationMin?.toString() ?? "");
  const [notes, setNotes] = useState(editFeed?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dayFeedCount, setDayFeedCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "feeds"), where("date", "==", date), where("type", "==", "day"));
    return onSnapshot(q, (snap) => {
      setDayFeedCount(snap.size);
    });
  }, [date]);

  const startDate = useMemo(() => {
    const [h, m] = time.split(":").map(Number);
    const [y, mo, d] = date.split("-").map(Number);
    return new Date(y, mo - 1, d, h, m);
  }, [date, time]);

  const feedType = getFeedType(startDate);

  const currentDayFeedCount = useMemo(() => {
    if (editFeed && editFeed.type === "day") return dayFeedCount - 1;
    return dayFeedCount;
  }, [dayFeedCount, editFeed]);

  const computedOz = useMemo(() => {
    if (method === "breast" && durationMin) {
      return computeBreastOz(Number(durationMin));
    }
    return null;
  }, [method, durationMin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (method === "bottle" && (!amountOz || Number(amountOz) <= 0)) {
      setError("Amount is required for bottle feeds");
      return;
    }
    if (method === "breast" && (!durationMin || Number(durationMin) <= 0)) {
      setError("Duration is required for breast feeds");
      return;
    }

    setSaving(true);
    try {
      if (editFeed) {
        await updateFeed(editFeed.id, {
          startTime: startDate,
          method,
          amountOz: method === "breast" ? computeBreastOz(Number(durationMin)) : Number(amountOz),
          durationMin: durationMin ? Number(durationMin) : null,
          notes: notes || null,
        });
      } else {
        await addFeed({
          startTime: startDate,
          method,
          amountOz: method === "bottle" ? Number(amountOz) : undefined,
          durationMin: durationMin ? Number(durationMin) : undefined,
          notes: notes || undefined,
        });
      }
      onSaved?.();
    } catch (err: any) {
      console.error("Error saving feed:", err);
      if (err?.code === "permission-denied") {
        setError("Firebase Error: Missing or insufficient permissions. Please check Firestore security rules.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to save feed. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <TimePicker label="Time" value={time} onChange={setTime} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={feedType === "day" ? "day" : "night"}>
          {feedType === "day" ? "Day Feed" : "Night Feed"}
        </Badge>
        {feedType === "day" && (
          <Badge variant="default">
            Feed #{currentDayFeedCount + 1}
          </Badge>
        )}
      </div>

      <AnimatePresence>
        {feedType === "day" && currentDayFeedCount >= TARGET_DAY_FEEDS && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl bg-warm-cream-200 px-3 py-2 text-sm text-warm-cream-800"
          >
            Goal: {TARGET_DAY_FEEDS} feeds per day. This will be feed #{currentDayFeedCount + 1}.
          </motion.div>
        )}
      </AnimatePresence>

      <Select
        label="Method"
        value={method}
        onChange={(e) => setMethod(e.target.value as "bottle" | "breast")}
        options={[
          { value: "bottle", label: "Bottle" },
          { value: "breast", label: "Breast" },
        ]}
      />

      {method === "bottle" ? (
        <Input
          label="Amount (oz)"
          type="number"
          step="0.5"
          min="0"
          value={amountOz}
          onChange={(e) => setAmountOz(e.target.value)}
          placeholder="e.g. 6"
        />
      ) : (
        <div className="space-y-2">
          <Input
            label="Duration (minutes)"
            type="number"
            min="1"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder="e.g. 30"
          />
          {computedOz !== null && (
            <p className="text-sm text-slate-blue-500">
              Estimated: {computedOz} oz ({durationMin} min × 0.1 oz/min)
            </p>
          )}
        </div>
      )}

      {method === "bottle" && (
        <Input
          label="Duration (minutes, optional)"
          type="number"
          min="1"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
          placeholder="Optional"
        />
      )}

      <Input
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any observations..."
      />

      {error && (
        <p className="text-sm text-muted-rose-500">{error}</p>
      )}

      <Button type="submit" loading={saving} className="w-full">
        {editFeed ? "Update Feed" : "Log Feed"}
      </Button>
    </motion.form>
  );
}
