"use client";

import { useMemo } from "react";

interface DataPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  data: DataPoint[];
  targetValue?: number;
  targetLabel?: string;
  unit?: string;
  color?: string;
  height?: number;
}

export default function TrendChart({
  data,
  targetValue,
  targetLabel,
  unit = "",
  color = "var(--color-slate-blue-500)",
  height = 120,
}: TrendChartProps) {
  const { points, targetY, maxVal, minVal } = useMemo(() => {
    if (data.length === 0) return { points: "", targetY: 0, maxVal: 0, minVal: 0 };

    const values = data.map((d) => d.value);
    const allValues = targetValue !== undefined ? [...values, targetValue] : values;
    const maxV = Math.max(...allValues) * 1.1 || 1;
    const minV = Math.min(0, ...allValues);
    const range = maxV - minV || 1;

    const padding = 8;
    const chartWidth = 100 - padding * 2;
    const chartHeight = 100 - padding * 2;

    const pts = data
      .map((d, i) => {
        const x = padding + (data.length === 1 ? chartWidth / 2 : (i / (data.length - 1)) * chartWidth);
        const y = padding + chartHeight - ((d.value - minV) / range) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    const tY = targetValue !== undefined
      ? padding + chartHeight - ((targetValue - minV) / range) * chartHeight
      : 0;

    return { points: pts, targetY: tY, maxVal: maxV, minVal: minV };
  }, [data, targetValue]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-slate-blue-50 p-4" style={{ height }}>
        <p className="text-xs text-slate-blue-400">No data yet</p>
      </div>
    );
  }

  return (
    <div className="relative" role="img" aria-label={`Trend chart${targetLabel ? ` with target: ${targetLabel}` : ""}`}>
      <svg viewBox="0 0 100 100" style={{ height }} className="w-full" preserveAspectRatio="none">
        {/* Target line */}
        {targetValue !== undefined && (
          <line
            x1="8" y1={targetY} x2="92" y2={targetY}
            stroke="var(--color-soft-teal-300)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        )}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {data.map((d, i) => {
          const padding = 8;
          const chartWidth = 100 - padding * 2;
          const chartHeight = 100 - padding * 2;
          const range = (maxVal - minVal) || 1;
          const x = padding + (data.length === 1 ? chartWidth / 2 : (i / (data.length - 1)) * chartWidth);
          const y = padding + chartHeight - ((d.value - minVal) / range) * chartHeight;
          return (
            <circle key={i} cx={x} cy={y} r="1.8" fill={color} />
          );
        })}
      </svg>

      {/* Labels */}
      <div className="mt-1 flex justify-between px-1">
        {data.length <= 14 ? (
          data.map((d, i) => (
            <span key={i} className="text-[8px] text-slate-blue-400">
              {d.label}
            </span>
          ))
        ) : (
          <>
            <span className="text-[8px] text-slate-blue-400">{data[0].label}</span>
            <span className="text-[8px] text-slate-blue-400">{data[data.length - 1].label}</span>
          </>
        )}
      </div>

      {/* Target label */}
      {targetLabel && (
        <span className="absolute right-1 text-[9px] font-medium text-soft-teal-600" style={{ top: 4 }}>
          {targetLabel}
        </span>
      )}

      {/* Screen reader table */}
      <table className="sr-only">
        <caption>Trend data</caption>
        <thead>
          <tr><th>Date</th><th>Value</th></tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}><td>{d.label}</td><td>{d.value}{unit}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
