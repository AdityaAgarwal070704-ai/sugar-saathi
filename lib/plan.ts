// Free vs Pro. One place decides who gets what. Pure functions, no browser or server APIs.
export type Tier = "free" | "trial" | "pro";

export const TRIAL_DAYS = 7;
const DAY = 86400_000;

// Features that are Pro (and therefore also available during the 7-day trial).
export type Feature =
  | "photo" // photo logging
  | "aiRecipe" // "describe it" AI fill in the recipe builder
  | "personalResponse" // expected change in your sugar
  | "progress30" // 30-day progress view
  | "dishRanking" // gentle vs spiky dishes
  | "walkEffect" // walks vs rise
  | "gmi" // estimated GMI
  | "aiSummary" // AI weekly summary
  | "planner" // AI day meal planner
  | "report" // educator report
  | "share" // WhatsApp share
  | "csvImport"; // CSV glucose import

export const PRO_FEATURES: Feature[] = ["photo", "aiRecipe", "personalResponse", "progress30", "dishRanking", "walkEffect", "gmi", "aiSummary", "planner", "report", "share", "csvImport"];

export const FEATURE_LABEL: Record<Feature, string> = {
  photo: "Photo logging",
  aiRecipe: "Describe-it recipe fill",
  personalResponse: "Expected change in your sugar",
  progress30: "30-day progress",
  dishRanking: "Gentle vs spiky dishes",
  walkEffect: "Walks and your rise",
  gmi: "Estimated GMI",
  aiSummary: "AI weekly summary",
  planner: "Day meal planner",
  report: "Educator report",
  share: "WhatsApp sharing",
  csvImport: "CSV glucose import",
};

export function can(tier: Tier, feature: Feature): boolean {
  return tier !== "free" || !PRO_FEATURES.includes(feature);
}

export type UsageKind = "parse" | "photo" | "recipe" | "insights" | "plan";

// Daily caps on AI requests (the parts that cost money).
export const DAILY_LIMITS: Record<Tier, Record<UsageKind, number>> = {
  free: { parse: 8, photo: 0, recipe: 0, insights: 0, plan: 0 },
  trial: { parse: 60, photo: 20, recipe: 20, insights: 10, plan: 10 },
  pro: { parse: 60, photo: 20, recipe: 20, insights: 10, plan: 10 },
};

// Which Pro feature each AI route belongs to (null = available on Free, within the daily cap).
export const ROUTE_FEATURE: Record<UsageKind, Feature | null> = { parse: null, photo: "photo", recipe: "aiRecipe", insights: "aiSummary", plan: "planner" };

export type PlanStatus = {
  tier: Tier;
  trialEndsAt: string | null; // ISO, when the trial ends (or ended)
  trialDaysLeft: number; // whole days left, 0 when not on a trial
  trialExpired: boolean; // true once the trial is over and the user is on Free
};

// trial: trialStartMs + 7 days. pro: an explicit grant (for example the PRO_EMAILS list, later a paid subscription).
export function planStatus(opts: { trialStartMs: number | null; isPro: boolean; nowMs: number }): PlanStatus {
  const { trialStartMs, isPro, nowMs } = opts;
  const endsMs = trialStartMs === null ? null : trialStartMs + TRIAL_DAYS * DAY;
  const trialActive = endsMs !== null && nowMs < endsMs;
  const base = { trialEndsAt: endsMs === null ? null : new Date(endsMs).toISOString() };
  if (isPro) return { tier: "pro", ...base, trialDaysLeft: 0, trialExpired: false };
  if (trialActive) return { tier: "trial", ...base, trialDaysLeft: Math.max(1, Math.ceil((endsMs - nowMs) / DAY)), trialExpired: false };
  return { tier: "free", ...base, trialDaysLeft: 0, trialExpired: endsMs !== null };
}

// "ada@x.com, Bob@y.com" -> a set of lowercase emails.
export function parseEmailList(raw: string | undefined | null): Set<string> {
  return new Set((raw ?? "").split(/[,\s;]+/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")));
}
