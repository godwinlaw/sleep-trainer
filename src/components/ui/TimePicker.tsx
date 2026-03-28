interface TimePickerProps {
  label?: string;
  value: string; // HH:MM format
  onChange: (value: string) => void;
  className?: string;
}

export default function TimePicker({ label, value, onChange, className = "" }: TimePickerProps) {
  const id = label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-blue-700">
          {label}
        </label>
      )}
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-2xl border border-slate-blue-200 bg-white px-3.5 py-2.5 text-sm text-foreground transition-colors ${className}`}
      />
    </div>
  );
}
