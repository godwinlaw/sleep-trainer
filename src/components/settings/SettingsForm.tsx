"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";
import { formatDuration } from "@/lib/date-utils";
import {
  INITIAL_INTERVAL_MIN,
  TARGET_INTERVAL_MIN,
  INTERVAL_STEP_MIN,
} from "@/lib/constants";
import type { AppSettings } from "@/lib/types";

const intervalOptions = (() => {
  const opts: { value: string; label: string }[] = [];
  for (let m = INITIAL_INTERVAL_MIN; m <= TARGET_INTERVAL_MIN; m += INTERVAL_STEP_MIN) {
    opts.push({ value: String(m), label: formatDuration(m) });
  }
  return opts;
})();

function SettingsFormInner({ settings, updateSettings }: {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}) {
  const [babyName, setBabyName] = useState(settings.babyName);
  const [startDate, setStartDate] = useState(settings.startDate);
  const [interval, setInterval] = useState(String(settings.currentIntervalMin));
  const [dailyOz, setDailyOz] = useState(String(settings.dailyOzMinimum));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({
      babyName: babyName.trim(),
      startDate,
      currentIntervalMin: Number(interval),
      dailyOzMinimum: Number(dailyOz),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-4 text-sm font-medium text-slate-blue-500">Baby Info</h3>
        <div className="space-y-4">
          <Input
            label="Baby's Name"
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            placeholder="e.g. Luna"
          />
          <Input
            label="Program Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-medium text-slate-blue-500">Feeding Goals</h3>
        <div className="space-y-4">
          <Select
            label="Current Interval Goal"
            options={intervalOptions}
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
          />
          <Input
            label="Daily Oz Minimum"
            type="number"
            min="0"
            step="1"
            value={dailyOz}
            onChange={(e) => setDailyOz(e.target.value)}
          />
        </div>
      </Card>

      <Button onClick={handleSave} loading={saving} className="w-full">
        Save Settings
      </Button>

      <AnimatePresence>
        {saved && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm font-medium text-soft-teal-600"
            role="status"
          >
            Settings saved
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsForm() {
  const { settings, updateSettings, loading } = useSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-slate-blue-400">Loading...</p>
      </div>
    );
  }

  // Key-based remount: when settings load, inner form initializes from them
  return (
    <SettingsFormInner
      key={JSON.stringify(settings)}
      settings={settings}
      updateSettings={updateSettings}
    />
  );
}
