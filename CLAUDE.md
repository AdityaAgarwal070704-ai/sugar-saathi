# Sugar Saathi

[MVP_SCOPE.md](MVP_SCOPE.md) is the original MVP scope. On 2026-10-22 the user expanded it to a full subscription product (see "v2 scope" in [PRODUCT.md](PRODUCT.md)). Follow PRODUCT.md for what to build.

Hard rules that still apply everywhere (UI text, prompts, code):
- Carbs, fibre, protein and glycemic load come only from `data/foods.json`, never from the AI.
- Real glucose values only come from the user (manual entry or CSV import). Never invent or predict a user's glucose reading.
- Food guidance only. No insulin, dose or medication advice. Suggestions are worded as things to discuss with an educator or doctor.
- API keys live in `.env.local` and Vercel's settings. Never write them into code, docs or commits, and never ask the user to paste them into chat.
