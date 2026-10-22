import type { ReactNode } from "react";

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line bg-paper px-6 py-10 text-center">
      <svg width="88" height="72" viewBox="0 0 88 72" aria-hidden="true">
        <ellipse cx="44" cy="62" rx="30" ry="6" fill="#f2e9da" />
        <path d="M14 34h60c0 14-12 24-30 24S14 48 14 34z" fill="#e3efe7" stroke="#1b4d3e" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M34 26c-4-5 3-8 0-13M46 26c-4-5 3-8 0-13M58 26c-4-5 3-8 0-13" stroke="#e9a23b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <div className="max-w-sm text-sm text-muted">{children}</div>
      {action}
    </div>
  );
}
