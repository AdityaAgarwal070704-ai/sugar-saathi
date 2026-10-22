import type { Streak } from "@/lib/streak";
import { Pill } from "./Pill";

export function StreakChip({ streak }: { streak: Streak }) {
  if (streak.state === "new") return <Pill tone="neutral">🌱 Start your first day</Pill>;
  if (streak.state === "welcome-back") return <Pill tone="neutral">🌿 Welcome back</Pill>;
  const days = `${streak.current} day${streak.current === 1 ? "" : "s"} in a row`;
  if (streak.state === "keep-going") return <Pill tone="warn">🔥 {days}: log today to keep going</Pill>;
  return <Pill tone="good">🔥 {days}</Pill>;
}
