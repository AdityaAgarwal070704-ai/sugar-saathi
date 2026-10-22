// Small inline SVG icons (stroke style), so the app needs no icon library.
type P = { className?: string };
const base = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const HomeIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>);
export const ChartIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-8" /><path d="M22 20H2" /></svg>);
export const PlusIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>);
export const CompassIcon = ({ className }: P) => (<svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>);
export const UserIcon = ({ className }: P) => (<svg {...base} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>);
export const MicIcon = ({ className }: P) => (<svg {...base} className={className}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
export const CameraIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>);
export const CheckIcon = ({ className }: P) => (<svg {...base} className={className}><path d="m5 12.5 4.5 4.5L19 7" /></svg>);
export const SearchIcon = ({ className }: P) => (<svg {...base} className={className}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>);
export const CloseIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const ChevronIcon = ({ className }: P) => (<svg {...base} className={className}><path d="m9 6 6 6-6 6" /></svg>);
export const DropIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" /></svg>);

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#1b4d3e" />
      <path d="M32 11 C43 24 48 31 48 38 A16 16 0 0 1 16 38 C16 31 21 24 32 11 Z" fill="#e9a23b" />
      <path d="M32 27 C32 36 32 42 32 50" stroke="#1b4d3e" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M32 38 C27 36 25 34 24 31 M32 43 C37 41 39 39 40 36" stroke="#1b4d3e" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
