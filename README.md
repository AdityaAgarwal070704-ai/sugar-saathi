# Sugar Saathi

A free web app for Indian adults managing type 2 diabetes. Describe a meal in everyday words, get an honest carb estimate and practical feedback, and see every meal beside your glucose.

Live app: https://sugar-saathi.vercel.app. No sign-up. Your data stays in your own browser.

- Original MVP scope: [MVP_SCOPE.md](MVP_SCOPE.md)
- Current product scope and decisions: [PRODUCT.md](PRODUCT.md)

## What it does

- **Log meals in plain words** ("2 rotis, 1 katori dal, aloo sabzi"), then confirm portions in one tap.
- **Nutrition from an Indian food table:** carbs, fibre, protein and glycemic load per meal.
- **Per-meal feedback:** what's good, what could be better, and swaps (for example brown rice for white, with the carbs saved).
- **Glucose:** quick entry or CSV import (LibreView-style, mg/dL or mmol/L). Every meal is automatically paired with its before and 2-hour readings.
- **Dashboard, history and weekly insights:** rule-based observations, plus an AI summary of possible links to discuss with your educator.
- **Educator report:** a one-page weekly summary to print or save as PDF.
- **Meal planner:** an AI-proposed day of Indian meals within your carb goal and diet, with every number calculated from the table.
- **Your goals:** set your own per-meal carb goal, glucose range and diet.
- **Backup and restore:** export everything to a file and restore it later.

## Rules the app follows

- **Numbers come from code, not AI.** Carbs, fibre, protein and glycemic load come only from `data/foods.json`. The AI only turns words into dishes, writes the weekly narrative from numbers that were already calculated, and proposes plans using table dishes that code then checks and calculates.
- **Glucose is never invented.** Readings are only what the user enters or imports. The app does not predict glucose.
- **Food guidance only.** No insulin, dose or medication advice. Every piece of AI text goes through a filter (`lib/guardrails.ts`) that blocks dosing and medication language, and the prompts forbid it. Patterns are worded as "possible links to discuss with your educator".
- **Private by design.** There are no accounts and no database. Meals, readings and goals live in the browser's local storage on the user's own device. The only things sent to a server are the meal text (to be split into dishes) and, for the AI summary, statistics the browser calculated. CSV files are read on the device and never uploaded.

## Architecture: Input → AI → Logic → Action → Output

| Stage | What happens | Who does it |
|---|---|---|
| **Input** | Meal text; glucose entered or imported from CSV; goals in Settings | Human |
| **AI** | Splits meal text into table dishes with counts and confidence; writes the weekly narrative; proposes a day plan (Gemini through OpenRouter) | AI |
| **Logic** | Validates AI output against the table; nutrition maths; meal-to-glucose pairing (before: 45 min before to 10 min after eating; after: 90 to 180 min, nearest 2 hours); weekly stats; rule-based tips and swaps; the safety filter | Plain code |
| **Action** | User confirms or edits portions and dishes, saves the meal, adds readings | Human |
| **Output** | Dashboard, per-meal tips, history, weekly insights, educator report, meal plan | Plain code (plus AI text where marked) |

Stack: Next.js (App Router) on Vercel; browser local storage for data; Gemini via OpenRouter for the four AI features (meal text, meal photo, weekly summary, day plan). Installable on your phone as an app (PWA).

Key files:
- `lib/` has the engines: `carbs.ts`, `insights.ts`, `pairing.ts`, `stats.ts`, `csv.ts`, `guardrails.ts`, `ai.ts`, and the browser storage layer (`store.ts`, `store-core.ts`)
- `app/app/` has the screens
- `app/api/` has four routes: `parse-meal`, `parse-photo`, `insights` and `plan`
- `data/foods.json` is the food table
- `tests/logic.test.ts` has the unit tests

## Run it locally

You need Node.js (LTS) and an OpenRouter key.

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and replace the placeholder with your key from openrouter.ai (never commit this file; git already ignores it):

```
OPENROUTER_API_KEY=your-key-here
```

Then start the app and open http://localhost:3000:

```bash
npm run dev
```

Run the unit tests with:

```bash
npx tsx --test tests/logic.test.ts
```

## Deploy to Vercel

Import the repo in Vercel (or run `npx vercel deploy --prod`), add `OPENROUTER_API_KEY` under Project Settings → Environment Variables, and redeploy.

## Failure cases and how the screen handles them

| What could go wrong | What the user sees |
|---|---|
| Empty, too-long or non-food meal text | A clear message; no AI call for empty text; "I couldn't find any food in that" for gibberish |
| Dish not in the table | Red "Not in my table, not counted"; the total is labelled partial; nothing is guessed |
| AI picks the wrong dish | Each row shows what you typed beside what it matched, a dropdown to change it, and an amber "Check this" when unsure |
| AI invents a dish id or returns broken data | Code rejects it; the user sees "Couldn't reach the AI, try again" |
| AI text that sounds like dosing advice | Blocked by the safety filter; rule-based insights still show |
| Too many AI requests in a short time | A clear "please wait" message (a simple per-IP limit) |
| CSV that isn't a glucose export, or has bad rows | A clear message; unreadable rows are skipped and counted |
| Impossible glucose values (outside 40 to 600 mg/dL) | Rejected inline |
| Browser storage full or blocked | A message explaining how to export a backup and clear old data |
| Corrupted or hostile backup file | Rejected, or bad rows are dropped; never trusted |

## Known limits

- **Data lives in one browser on one device.** Clearing browser data or switching device loses it, so use Settings → Export backup. There is no sync.
- The food table is a **starter set of 215 dishes with approximate values, not verified by a dietitian**. It must be reviewed before real use, and the app says so on screen.
- Glycemic-load ratings and per-meal thresholds are simple starter rules, not clinically validated.
- The abuse limit on the AI routes is best-effort (per server instance), not a hard guarantee.
- This is not a medical device. It gives food guidance, not medical advice.
- Not built: accounts and cross-device sync, payments, direct CGM or meter sync, photo and voice input, regional languages, medication tracking, an educator-side dashboard.
