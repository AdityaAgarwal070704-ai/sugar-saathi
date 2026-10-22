import { supabaseConfigured } from "@/lib/supabase/config";
import { callModel } from "@/lib/ai";
import { aiUsedToday, loadMeals, loadReadings } from "@/lib/data";
import { loadFoods } from "@/lib/foods";
import { allSafe } from "@/lib/guardrails";
import { weeklyObservations } from "@/lib/insights";
import { pairMeals } from "@/lib/pairing";
import { weekStats } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

const DAILY_LIMIT = 10;

// Numbers are computed by code from the user's own data; the AI only words them.
export async function POST() {
  if (!supabaseConfigured) return Response.json({ error: "The app isn't fully set up yet (database missing)." }, { status: 503 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
  if (!profile) return Response.json({ error: "Your profile couldn't be loaded." }, { status: 500 });

  if ((await aiUsedToday(supabase, "insights")) >= DAILY_LIMIT) {
    return Response.json({ error: "You've reached today's limit for AI insights. Try again tomorrow." }, { status: 429 });
  }

  const foods = await loadFoods();
  if (!foods) return Response.json({ error: "Food table unavailable." }, { status: 500 });
  const [meals, readings] = await Promise.all([loadMeals(supabase, 7), loadReadings(supabase, 7)]);
  if (meals.length < 3) return Response.json({ error: "Log at least 3 meals this week to get an AI summary." }, { status: 400 });

  const p = profile as Profile;
  const stats = weekStats(pairMeals(meals, readings), readings, p, foods);
  const observations = weeklyObservations(stats, p);

  const result = (await callModel({
    system: `You write a short, kind, plain-language weekly summary for an adult with type 2 diabetes in India, from statistics that were already calculated for them.
Rules:
- Use only the numbers and facts given. Never invent numbers, meals or readings.
- Phrase every pattern as a "possible link to discuss with your educator", never as a conclusion or diagnosis.
- Mention confounders where relevant (skipped meals, activity, stress, illness, alcohol, medication changes) as things the person can note for their educator.
- Food guidance only. NEVER mention insulin, medication names, doses, units, or suggest any treatment change. If unsure, say "ask your educator or doctor".
- Be encouraging and specific. Keep each field short.
Only call the tool.`,
    user: JSON.stringify({ stats, observations, mealCarbGoalGrams: p.meal_carb_target, glucoseRange: [p.glucose_low, p.glucose_high] }),
    toolName: "write_summary",
    toolDescription: "Write the weekly summary.",
    schema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "2 to 3 sentences overview" },
        links: {
          type: "array",
          maxItems: 3,
          items: { type: "object", properties: { title: { type: "string" }, detail: { type: "string" } }, required: ["title", "detail"] },
        },
        suggestions: { type: "array", maxItems: 3, items: { type: "string" }, description: "Practical food suggestions for next week" },
      },
      required: ["summary", "links", "suggestions"],
    },
    maxTokens: 1500,
    timeoutMs: 25000,
  })) as { summary?: unknown; links?: { title?: unknown; detail?: unknown }[]; suggestions?: unknown[] } | null;

  if (!result || typeof result.summary !== "string" || !Array.isArray(result.links) || !Array.isArray(result.suggestions)) {
    return Response.json({ error: "Couldn't reach the AI, try again." }, { status: 502 });
  }
  const links = result.links.filter((l) => typeof l.title === "string" && typeof l.detail === "string").slice(0, 3) as { title: string; detail: string }[];
  const suggestions = result.suggestions.filter((s): s is string => typeof s === "string").slice(0, 3);

  // Safety filter: if anything sounds like dosing or medication advice, show nothing from the AI.
  if (!allSafe([result.summary, ...links.flatMap((l) => [l.title, l.detail]), ...suggestions])) {
    return Response.json({ blocked: true });
  }

  await supabase.from("ai_usage").insert({ kind: "insights" });
  return Response.json({ summary: result.summary, links, suggestions });
}
