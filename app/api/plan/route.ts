import { callModel } from "@/lib/ai";
import { nutritionOf } from "@/lib/carbs";
import { loadFoods } from "@/lib/foods";
import { allSafe } from "@/lib/guardrails";
import { mealTips } from "@/lib/insights";
import { authorize } from "@/lib/auth/server";


// The AI picks dishes and counts; code checks every dish and calculates every number.
export async function POST(request: Request) {
const auth = await authorize(request, "plan");
  if (!auth.ok) return auth.response;
  let body: { carbTarget?: unknown; diet?: unknown; snacks?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  const carbTarget = typeof body.carbTarget === "number" && body.carbTarget >= 20 && body.carbTarget <= 150 ? Math.round(body.carbTarget) : 60;
  const diet = body.diet === "egg" || body.diet === "nonveg" ? body.diet : "veg";
  const snacks = body.snacks === true;

  const all = await loadFoods();
  if (!all) return Response.json({ error: "Food table unavailable." }, { status: 500 });
  const allowed = all.filter((f) => (diet === "nonveg" ? true : diet === "egg" ? !f.tags.includes("nonveg") : !f.tags.includes("nonveg") && !f.tags.includes("egg")));
  const allowedIds = new Set(allowed.map((f) => f.id));
  const menu = allowed.map((f) => `${f.id} = ${f.name} (per ${f.unit}: ${f.carbs} g carbs, ${f.fibre} g fibre, ${f.protein} g protein)`).join("\n");
  const slots = snacks ? ["breakfast", "lunch", "snack", "dinner"] : ["breakfast", "lunch", "dinner"];

  const result = (await callModel({
    system: `You plan one day of everyday Indian home-style meals for an adult with type 2 diabetes.
Use ONLY dish ids from this list:
${menu}

Rules:
- Make these meals: ${slots.join(", ")}. Each main meal should aim for about ${carbTarget} g carbs (snack about ${Math.round(carbTarget / 3)} g), using the carbs shown per unit.
- Favour dal or legumes, vegetables, protein and fibre. Keep refined grains and sweets modest. Typical counts: roti 1 to 3, katori of rice 0.5 to 1.5.
- Counts are in the dish's own unit, in steps of 0.5.
- Give a short friendly "note" per meal (one sentence about why it works). Food guidance only. NEVER mention insulin, medication, doses or units, or any treatment.
Only call the tool.`,
    user: `Plan one day. Diet: ${diet}.`,
    toolName: "propose_plan",
    toolDescription: "Propose the day's meals.",
    schema: {
      type: "object",
      properties: {
        meals: {
          type: "array",
          items: {
            type: "object",
            properties: {
              slot: { type: "string", enum: slots },
              note: { type: "string" },
              items: { type: "array", items: { type: "object", properties: { foodId: { type: "string" }, count: { type: "number" } }, required: ["foodId", "count"] } },
            },
            required: ["slot", "note", "items"],
          },
        },
      },
      required: ["meals"],
    },
    maxTokens: 2000,
    timeoutMs: 25000,
  })) as { meals?: { slot?: unknown; note?: unknown; items?: { foodId?: unknown; count?: unknown }[] }[] } | null;

  if (!result || !Array.isArray(result.meals)) return Response.json({ error: "Couldn't reach the AI, try again." }, { status: 502 });

  const meals = [];
  for (const m of result.meals) {
    if (typeof m.slot !== "string" || !slots.includes(m.slot) || !Array.isArray(m.items)) continue;
    const items = m.items
      .filter((i): i is { foodId: string; count: number } => typeof i.foodId === "string" && allowedIds.has(i.foodId) && typeof i.count === "number" && Number.isFinite(i.count))
      .map((i) => ({ foodId: i.foodId, count: Math.min(Math.max(Math.round(i.count * 2) / 2, 0.5), 6) }));
    if (items.length === 0) continue;
    const note = typeof m.note === "string" && allSafe([m.note]) ? m.note : "";
    const n = nutritionOf(items, all);
    meals.push({
      slot: m.slot,
      note,
      items: items.map((i) => {
        const f = all.find((x) => x.id === i.foodId)!;
        return { name: f.name, icon: f.icon, unit: f.unit, count: i.count, carbs: Math.round(f.carbs * i.count) };
      }),
      nutrition: n,
      overTarget: n.carbs > (m.slot === "snack" ? carbTarget / 3 : carbTarget) * 1.2,
      tips: mealTips(items, all, { meal_carb_target: carbTarget }),
    });
  }
  if (meals.length === 0) return Response.json({ error: "The planner didn't return a usable plan. Try again." }, { status: 502 });

  auth.commit();
  return Response.json({ meals, carbTarget, diet });
}
