// Server-only: one place that talks to the AI. Every request is served by Google's own infrastructure.
const MODEL = "google/gemini-3.5-flash-lite";

type Schema = Record<string, unknown>;

export async function callModel(opts: {
  system: string;
  user: string;
  toolName: string;
  toolDescription: string;
  schema: Schema;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<unknown | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(opts.timeoutMs ?? 15000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: opts.maxTokens ?? 1500,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        tools: [{ type: "function", function: { name: opts.toolName, description: opts.toolDescription, parameters: opts.schema } }],
        tool_choice: { type: "function", function: { name: opts.toolName } },
        provider: { only: ["google-vertex", "google-ai-studio"], allow_fallbacks: false },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return typeof args === "string" ? JSON.parse(args) : null;
  } catch {
    return null;
  }
}
