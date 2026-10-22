import { callModel } from "@/lib/ai";
import { loadFoods } from "@/lib/foods";
import { cleanCustom, cleanItems, ITEMS_SCHEMA, textSystem } from "@/lib/parse";
import { tooMany } from "@/lib/ratelimit";
import type { ParseResponse } from "@/lib/types";

const MAX_TEXT = 300;

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (tooMany(request, "parse", 40)) return fail("Too many requests right now. Please wait a few minutes and try again.", 429);

  let text: unknown;
  let custom: unknown;
  try {
    const body = await request.json();
    text = body.text;
    custom = body.custom;
  } catch {
    return fail("Type what you ate.", 400);
  }
  if (typeof text !== "string" || text.trim() === "") return fail("Type what you ate.", 400);
  if (text.length > MAX_TEXT) return fail("Please keep it to one meal (under 300 characters).", 400);

  const base = await loadFoods();
  if (!base) return fail("Food table unavailable.", 500);
  const foods = [...cleanCustom(custom), ...base];

  const result = await callModel({
    system: textSystem(foods),
    user: text,
    toolName: "report_items",
    toolDescription: "Report the items found in the meal description.",
    schema: ITEMS_SCHEMA,
    maxTokens: 1500,
  });

  const items = cleanItems(result, foods);
  if (!items) return fail("Couldn't reach the AI, try again.", 502);

  const body: ParseResponse = { items };
  return Response.json(body);
}
