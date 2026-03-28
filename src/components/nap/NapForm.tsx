"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TimePicker from "@/components/ui/TimePicker";
import { addNap, updateNap } from "@/lib/naps";
import { getDateString, fromTimestamp, inferNapType } from "@/lib/date-utils";
import { getNapWarning } from "@/lib/calculations";
import { useFeeds } from "@/hooks/useFeeds";
import type { NapRecord, NapType } from "@/lib/types";

interface NapFormProps {
  editNap?: NapRecord | null;
  onSaved?: () => void;
}

function nowTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function NapForm({ editNap, onSaved }: NapFormProps) {
  const [date, setDate] = useState(editNap ? editNap.date : getDateString(new Date()));
  const [time, setTime] = useState(() => {
    if (editNap) {
      const d = fromTimestamp(editNap.startTime);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return nowTimeStr();
  });
  const [durationMin, setDurationMin] = useState(editNap?.durationMin?.toString() ?? "");
  const [napType, setNapType] = useState<NapType>(editNap?.napType ?? "morning");
  const [autoType, setAutoType] = useState(!editNap);
  const [notes, setNotes] = useState(editNap?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { dayFeeds } = useFeeds(date);

  const startDate = useMemo(() => {
    const [h, m] = time.split(":").map(Number);
    const [y, mo, d] = date.split("-").map(Number);
    return new Date(y, mo - 1, d, h, m);
  }, [date, time]);

  // Auto-infer nap type from feed times
  useMemo(() => {
    if (!autoType || dayFeeds.length < 2) return;
    const feed1 = fromTimestamp(dayFeeds[0].startTime);
    const feed2 = fromTimestamp(dayFeeds[1].startTime);
    const inferred = inferNapType(startDate, feed1, feed2);
    setNapType(inferred);
  }, [startDate, dayFeeds, autoType]);

  const warning = useMemo(() => {
    return getNapWarning(startDate, dayFeeds);
  }, [startDate, dayFeeds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!durationMin || Number(durationMin) <= 0) {
      setError("Duration is required");
      return;
    }

    setSaving(true);
    try {
      if (editNap) {
        await updateNap(editNap.id, {
          startTime: startDate as unknown as import("firebase/firestore").Timestamp,
          durationMin: Number(durationMin),
          napType,
          notes: notes || null,
          date,
        });
      } else {
        await addNap({
          startTime: startDate,
          durationMin: Number(durationMin),
          napType,
          notes: notes || undefined,
        });
      }
      onSaved?.();
    } catch {
      setError("Failed to save nap. Please try again.");
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
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex-1">
          <TimePicker label="Time" value={time} onChange={setTime} />
        </div>
      </div>

      <Input
        label="Duration (minutes)"
        type="number"
        min="1"
        value={durationMin}
        onChange={(e) => setDurationMin(e.target.value)}
        placeholder="e.g. 60"
      />

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Select
            label="Nap Type"
            value={napType}
            onChange={(e) => {
              setNapType(e.target.value as NapType);
              setAutoType(false);
            }}
            options={[
              { value: "morning", label: "Morning" },
              { value: "afternoon", label: "Afternoon" },
            ]}
          />
        </div>
        {!autoType && (
          <button
            type="button"
            className="mb-0.5 text-xs text-slate-blue-400 hover:text-slate-blue-600"
            onClick={() => setAutoType(true)}
          >
            Auto-detect
          </button>
        )}
      </div>

      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl bg-warm-cream-200 px-3 py-2 text-sm text-warm-cream-800"
          >
            {warning}
          </motion.div>
        )}
      </AnimatePresence>

      <Input
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any observations..."
      />

      {error && <p className="text-sm text-muted-rose-500">{error}</p>}

      <Button type="submit" loading={saving} className="w-full">
        {editNap ? "Update Nap" : "Log Nap"}
      </Button>
    </motion.form>
  );
}
