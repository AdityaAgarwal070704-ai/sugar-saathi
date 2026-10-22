import { dayKey } from "@/lib/day";

// Seven dots for the last seven days: filled where a meal was logged. Gentle, no counting down.
export default function WeekDots({ logged, now }: { logged: Set<string>; now: Date }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return { key: dayKey(d), label: d.toLocaleDateString("en-IN", { weekday: "narrow" }), today: i === 6 };
  });
  return (
    <ul className="flex gap-2" aria-label="Days logged this week">
      {days.map((d) => (
        <li key={d.key} className="flex flex-col items-center gap-1">
          <span className={`h-5 w-5 rounded-full border-2 ${logged.has(d.key) ? "border-moss bg-moss" : d.today ? "border-saffron bg-paper" : "border-line bg-paper"}`} role="img" aria-label={`${d.key}: ${logged.has(d.key) ? "logged" : "not logged"}`} />
          <span className="text-[10px] text-muted">{d.label}</span>
        </li>
      ))}
    </ul>
  );
}
