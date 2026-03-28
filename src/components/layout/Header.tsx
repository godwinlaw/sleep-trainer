interface HeaderProps {
  title: string;
  backHref?: string;
  rightHref?: string;
  rightIcon?: React.ReactNode;
  rightLabel?: string;
}

export default function Header({ title, backHref, rightHref, rightIcon, rightLabel }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-blue-100 bg-warm-cream-50/80 px-4 py-3 backdrop-blur-sm">
      {backHref && (
        <a
          href={backHref}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-blue-600 hover:bg-slate-blue-50"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
      <h1 className="flex-1 text-lg font-semibold text-slate-blue-800">{title}</h1>
      {rightHref && rightIcon && (
        <a
          href={rightHref}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-blue-500 hover:bg-slate-blue-50"
          aria-label={rightLabel || "Action"}
        >
          {rightIcon}
        </a>
      )}
    </header>
  );
}
