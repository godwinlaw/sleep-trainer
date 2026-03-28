interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-blue-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-2xl border border-slate-blue-200 bg-white px-3.5 py-2.5 text-sm text-foreground placeholder:text-slate-blue-300 transition-colors ${
          error ? "border-muted-rose-400" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-muted-rose-500">{error}</p>}
    </div>
  );
}
