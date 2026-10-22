import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Food, ParseResponse } from "@/lib/types";

const MAX_TEXT = 300;
const MODEL = "google/gemini-3.5-flash-lite";

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

// Load the food table. Any problem here means we refuse to answer rather than guess.
async function loadFoods(): Promise<Food[] | null> {
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "foods.json"), "utf8");
    const foods = JSON.parse(raw).foods;
    if (!Array.isArray(foods) || foods.length === 0) return null;
    for (const f of foods) {
      if (
        typeof f.id !== "string" ||
        typeof f.name !== "string" ||
        typeof f.unit !== "string" ||
        typeof f.carbs !== "number"
      ) {
        return null;
      }
    }
    return foods as Food[];
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let text: unknown;
  try {
    text = (await request.json()).text;
  } catch {
    return fail("Type what you ate.", 400);
  }
  if (typeof text !== "string" || text.trim() === "") {
    return fail("Type what you ate.", 400);
  }
  if (text.length > MAX_TEXT) {
    return fail("Please keep it to one meal (under 300 characters).", 400);
  }

  const foods = await loadFoods();
  if (!foods) return fail("Food table unavailable.", 500);

  if (!process.env.OPENROUTER_API_KEY) {
    return fail("Couldn't reach the AI, try again.", 502);
  }

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

  let toolInput: unknown;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [
          { role: "system", content: system },
          { role: "user", content: text },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_items",
              description: "Report the items found in the meal description.",
              parameters: {
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
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_items" } },
        // Only Google's own infrastructure may serve the request.
        provider: { only: ["google-vertex", "google-ai-studio"], allow_fallbacks: false },
      }),
    });
    if (!res.ok) return fail("Couldn't reach the AI, try again.", 502);
    const data = await res.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    toolInput = typeof args === "string" ? JSON.parse(args) : undefined;
  } catch {
    return fail("Couldn't reach the AI, try again.", 502);
  }

  // Never trust the AI's answer: check every field before using it.
  const rawItems = (toolInput as { items?: unknown } | undefined)?.items;
  if (!Array.isArray(rawItems)) return fail("Couldn't reach the AI, try again.", 502);

  const known = new Set(foods.map((f) => f.id));
  const items: ParseResponse["items"] = [];
  for (const it of rawItems) {
    if (
      !it ||
      typeof it.typed !== "string" ||
      typeof it.count !== "number" ||
      !Number.isFinite(it.count) ||
      typeof it.confidence !== "number"
    ) {
      return fail("Couldn't reach the AI, try again.", 502);
    }
    items.push({
      typed: it.typed.slice(0, 80),
      foodId: typeof it.foodId === "string" && known.has(it.foodId) ? it.foodId : null,
      count: Math.min(Math.max(it.count, 0.25), 20),
      confidence: Math.min(Math.max(it.confidence, 0), 1),
    });
  }

  const body: ParseResponse = { items, foods };
  return Response.json(body);
}
