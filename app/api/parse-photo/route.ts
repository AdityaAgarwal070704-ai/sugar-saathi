import { callModel } from "@/lib/ai";
import { loadFoods } from "@/lib/foods";
import { cleanCustom, cleanItems, ITEMS_SCHEMA, photoSystem } from "@/lib/parse";
import { tooMany } from "@/lib/ratelimit";
import type { ParseResponse } from "@/lib/types";

const MAX_CHARS = 4_500_000; // about 3.3 MB of image after base64
const DATA_URL = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/;

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

// The photo is sent to the AI for this one request only. It is never stored by this app.
export async function POST(request: Request) {
  if (tooMany(request, "photo", 15)) return fail("Too many photos right now. Please wait a few minutes and try again.", 429);

  let image: unknown;
  let custom: unknown;
  try {
    const body = await request.json();
    image = body.image;
    custom = body.custom;
  } catch {
    return fail("Add a photo of your meal.", 400);
  }
  if (typeof image !== "string" || image.length === 0) return fail("Add a photo of your meal.", 400);
  if (image.length > MAX_CHARS) return fail("That photo is too large. Try again with a smaller one.", 413);
  if (!DATA_URL.test(image)) return fail("That doesn't look like a photo. Try again.", 400);

  const base = await loadFoods();
  if (!base) return fail("Food table unavailable.", 500);
  const foods = [...cleanCustom(custom), ...base];

  const result = await callModel({
    system: photoSystem(foods),
    user: [
      { type: "text", text: "List the dishes in this meal photo." },
      { type: "image_url", image_url: { url: image } },
    ],
    toolName: "report_items",
    toolDescription: "Report the dishes seen in the photo.",
    schema: ITEMS_SCHEMA,
    maxTokens: 1500,
    timeoutMs: 25000,
  });

  const items = cleanItems(result, foods, 0.75);
  if (!items) return fail("Couldn't reach the AI, try again.", 502);

  const body: ParseResponse = { items };
  return Response.json(body);
}
