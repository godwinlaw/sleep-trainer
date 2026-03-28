"use client";

import { motion } from "framer-motion";

type ProgressVariant = "default" | "success" | "caution" | "danger";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const variantColors: Record<ProgressVariant, string> = {
  default: "bg-slate-blue-400",
  success: "bg-soft-teal-400",
  caution: "bg-warm-cream-500",
  danger: "bg-muted-rose-400",
};

export default function ProgressBar({
  value,
  max = 100,
  variant = "default",
  label,
  showValue = false,
  className = "",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-slate-blue-600">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-blue-100"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <motion.div
          className={`h-full rounded-full ${variantColors[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  );
}
