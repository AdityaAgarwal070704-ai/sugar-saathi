import { supabaseConfigured } from "@/lib/supabase/config";
import { callModel } from "@/lib/ai";
import { loadFoods } from "@/lib/foods";
import { createClient } from "@/lib/supabase/server";
import { AI_LOGS_PER_DAY } from "@/lib/session";
import type { ParseResponse } from "@/lib/types";

const MAX_TEXT = 300;

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (!supabaseConfigured) return Response.json({ error: "The app isn't fully set up yet (database missing)." }, { status: 503 });
  let text: unknown;
  try {
    text = (await request.json()).text;
  } catch {
    return fail("Type what you ate.", 400);
  }
  if (typeof text !== "string" || text.trim() === "") return fail("Type what you ate.", 400);
  if (text.length > MAX_TEXT) return fail("Please keep it to one meal (under 300 characters).", 400);

  // Only signed-in users may spend AI calls.
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("Please sign in to log a meal.", 401);

  const limit = AI_LOGS_PER_DAY;
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await supabase
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("kind", "parse")
    .gte("created_at", since);
  const used = count ?? 0;
  if (used >= limit) return fail(`You've reached today's limit of ${limit} AI meal logs. Try again tomorrow.`, 429);

  const foods = await loadFoods();
  if (!foods) return fail("Food table unavailable.", 500);

  const menu = foods.map((f) => `${f.id} = ${f.name} (counted in ${f.unit}s)`).join("\n");
  const system = `You help split a described Indian home-cooked meal into items.
Map each item to ONE dish id from this list, or null if nothing fits. Never invent ids.

${menu}

Rules:
- "count" is how many of that dish's unit (shown in brackets in the list) the person ate. Convert loosely: "half plate" of rice is about 2 katori. Use 1 if no amount is given.
- "typed" is the person's own words for the item.
- "confidence" is 0 to 1: how sure you are about the dish match AND the count. Use below 0.7 when the dish is ambiguous (for example "dal" could be several dals) or the amount is a guess.
- If the text contains no food, return an empty items list.
- Never output carbohydrate, calorie or nutrition numbers, and never give health, medical or medication advice. Only call the tool.`;

  const result = await callModel({
    system,
    user: text,
    toolName: "report_items",
    toolDescription: "Report the items found in the meal description.",
    schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              typed: { type: "string" },
              foodId: { type: ["string", "null"] },
              count: { type: "number" },
              confidence: { type: "number" },
            },
            required: ["typed", "foodId", "count", "confidence"],
          },
        },
      },
      required: ["items"],
    },
    maxTokens: 1500,
  });

  // Never trust the AI's answer: check every field before using it.
  const rawItems = (result as { items?: unknown } | null)?.items;
  if (!Array.isArray(rawItems)) return fail("Couldn't reach the AI, try again.", 502);

  const known = new Set(foods.map((f) => f.id));
  const items: ParseResponse["items"] = [];
  for (const it of rawItems) {
    if (!it || typeof it.typed !== "string" || typeof it.count !== "number" || !Number.isFinite(it.count) || typeof it.confidence !== "number") {
      return fail("Couldn't reach the AI, try again.", 502);
    }
    items.push({
      typed: it.typed.slice(0, 80),
      foodId: typeof it.foodId === "string" && known.has(it.foodId) ? it.foodId : null,
      count: Math.min(Math.max(it.count, 0.25), 20),
      confidence: Math.min(Math.max(it.confidence, 0), 1),
    });
  }

  // Count the call only after the AI answered, so failures don't use up the free allowance.
  await supabase.from("ai_usage").insert({ user_id: auth.user.id, kind: "parse" });

  const body: ParseResponse = { items, foods, usage: { used: used + 1, limit } };
  return Response.json(body);
}
