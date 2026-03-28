type BadgeVariant = "default" | "day" | "night" | "morning" | "afternoon" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-blue-100 text-slate-blue-700",
  day: "bg-warm-cream-200 text-warm-cream-800",
  night: "bg-slate-blue-200 text-slate-blue-800",
  morning: "bg-soft-teal-100 text-soft-teal-700",
  afternoon: "bg-slate-blue-100 text-slate-blue-700",
  warning: "bg-muted-rose-100 text-muted-rose-700",
};

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
