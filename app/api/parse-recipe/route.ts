import { callModel } from "@/lib/ai";
import { loadIngredients } from "@/lib/ingredients";
import { tooMany } from "@/lib/ratelimit";
import { MAX_GRAMS, UNITS, unitsFor, type Unit } from "@/lib/recipe";

const MAX_TEXT = 500;

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export type ParsedRecipe = { name: string; servings: number | null; lines: { typed: string; ingredientId: string | null; amount: number; unit: Unit }[] };

// Turns "1 cup toor dal, 1 onion, 2 tsp oil, makes 4 servings" into ingredient lines. The AI only identifies
// ingredients and amounts; all nutrition is calculated from the ingredient table in the browser.
export async function POST(request: Request) {
  if (tooMany(request, "recipe", 20)) return fail("Too many requests right now. Please wait a few minutes and try again.", 429);

  let text: unknown;
  try {
    text = (await request.json()).text;
  } catch {
    return fail("Describe your recipe first.", 400);
  }
  if (typeof text !== "string" || text.trim() === "") return fail("Describe your recipe first.", 400);
  if (text.length > MAX_TEXT) return fail("Please keep it under 500 characters.", 400);

  const ingredients = await loadIngredients();
  if (!ingredients) return fail("Ingredient table unavailable.", 500);

  const menu = ingredients.map((i) => `${i.id} = ${i.name} (units: ${unitsFor(i).join(", ")})`).join("\n");
  const result = (await callModel({
    system: `You turn a home cook's description of a recipe into ingredient lines.
Use ONLY ingredient ids from this list, or null if an ingredient is not on it. Never invent ids.

${menu}

Rules:
- "amount" is a number in the given "unit". Use only a unit listed for that ingredient. Convert other measures: 1 katori is about 0.75 cup; a handful is about 30 g; "a little oil" is about 1 tsp. If no amount is given, make a sensible guess for a family dish.
- Skip salt, water and tiny amounts of whole spices. Count dry spice powders as spice_mix, about 1 tsp per dish.
- "servings" is how many people it serves if stated, otherwise null.
- "name" is a short name for the dish, or an empty string.
- "typed" is the ingredient as the cook said it.
- Never output nutrition numbers and never give health advice. Only call the tool.`,
    user: text,
    toolName: "report_recipe",
    toolDescription: "Report the recipe's ingredients.",
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        servings: { type: ["number", "null"] },
        lines: {
          type: "array",
          items: {
            type: "object",
            properties: { typed: { type: "string" }, ingredientId: { type: ["string", "null"] }, amount: { type: "number" }, unit: { type: "string", enum: UNITS } },
            required: ["typed", "ingredientId", "amount", "unit"],
          },
        },
      },
      required: ["name", "servings", "lines"],
    },
    maxTokens: 1500,
    timeoutMs: 25000,
  })) as { name?: unknown; servings?: unknown; lines?: unknown } | null;

  if (!result || !Array.isArray(result.lines)) return fail("Couldn't reach the AI, try again.", 502);

  const by = new Map(ingredients.map((i) => [i.id, i]));
  const lines: ParsedRecipe["lines"] = [];
  for (const l of result.lines.slice(0, 40)) {
    if (!l || typeof l.typed !== "string" || typeof l.amount !== "number" || !Number.isFinite(l.amount) || typeof l.unit !== "string") return fail("Couldn't reach the AI, try again.", 502);
    const ing = typeof l.ingredientId === "string" ? by.get(l.ingredientId) : undefined;
    const unit = (UNITS as string[]).includes(l.unit) ? (l.unit as Unit) : "g";
    // Only keep a match if the unit makes sense for that ingredient; otherwise the user must fix the line.
    const okUnit = ing ? unitsFor(ing).includes(unit) : false;
    const amount = Math.min(Math.max(Math.round(l.amount * 100) / 100, 0.1), MAX_GRAMS);
    lines.push({ typed: l.typed.slice(0, 60), ingredientId: ing && okUnit ? ing.id : null, amount, unit: okUnit ? unit : "g" });
  }
  if (lines.length === 0) return fail("I couldn't find any ingredients in that. Try listing them, for example: 1 cup toor dal, 1 onion, 2 tsp oil.", 422);

  const servings = typeof result.servings === "number" && Number.isInteger(result.servings) && result.servings >= 1 && result.servings <= 50 ? result.servings : null;
  const name = typeof result.name === "string" ? result.name.replace(/[^\p{L}\p{N} .,'()&-]/gu, "").trim().slice(0, 50) : "";
  const body: ParsedRecipe = { name, servings, lines };
  return Response.json(body);
}
