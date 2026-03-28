"use client";

import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import type { NapRecord } from "@/lib/types";
import { MORNING_NAP_TARGET_MIN, AFTERNOON_NAP_TARGET_MIN } from "@/lib/constants";

interface NapSummaryProps {
  morningNap: NapRecord | null;
  afternoonNap: NapRecord | null;
}

export default function NapSummary({ morningNap, afternoonNap }: NapSummaryProps) {
  const morningMin = morningNap?.durationMin ?? 0;
  const afternoonMin = afternoonNap?.durationMin ?? 0;

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-slate-blue-500">Naps</h3>
      <div className="space-y-3">
        <ProgressBar
          label={`Morning: ${morningMin}m / ${MORNING_NAP_TARGET_MIN}m`}
          value={morningMin}
          max={MORNING_NAP_TARGET_MIN}
          variant={morningMin >= MORNING_NAP_TARGET_MIN ? "success" : "default"}
        />
        <ProgressBar
          label={`Afternoon: ${afternoonMin}m / ${AFTERNOON_NAP_TARGET_MIN}m`}
          value={afternoonMin}
          max={AFTERNOON_NAP_TARGET_MIN}
          variant={afternoonMin >= AFTERNOON_NAP_TARGET_MIN ? "success" : "default"}
        />
      </div>
    </Card>
  );
}
