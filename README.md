# Sugar Saathi

A subscription web app for Indian adults managing type 2 diabetes. Describe a meal in everyday words, get an honest carb estimate and practical feedback, and see every meal beside your glucose.

Live app: https://sugar-saathi.vercel.app (see "Status" below for what needs setup first).

- Original MVP scope: [MVP_SCOPE.md](MVP_SCOPE.md)
- Current product scope (Free vs Pro, decisions): [PRODUCT.md](PRODUCT.md)

## What it does

| Feature | Free | Pro |
|---|---|---|
| Log meals in plain words ("2 rotis, 1 katori dal, aloo sabzi"), confirm portions in one tap | 3 AI logs a day | Unlimited |
| Carbs, fibre, protein and glycemic load per meal, from an Indian food table | Yes | Yes |
| Per-meal feedback: what's good, what could be better, swaps (for example brown rice for white, with carbs saved) | Yes | Yes |
| Quick glucose entry; every meal auto-paired with its before and 2-hour readings | Yes | Yes |
| Dashboard and rule-based weekly observations | Yes | Yes |
| History | Last 7 days | Full |
| CSV glucose import (LibreView-style, mg/dL or mmol/L) | No | Yes |
| AI weekly summary (possible links to discuss, food ideas) | No | Yes |
| One-page educator report (print or PDF) | No | Yes |
| AI day meal planner within your carb goal and diet | No | Yes |

## Rules the app follows

- **Numbers come from code, not AI.** Carbs, fibre, protein and glycemic load come only from `data/foods.json`. The AI only turns words into dishes, writes the weekly narrative from numbers that were already calculated, and proposes plans using table dishes that code then checks and calculates.
- **Glucose is never invented.** Readings are only what the user enters or imports. The app does not predict glucose.
- **Food guidance only.** No insulin, dose or medication advice. Every piece of AI text goes through a filter (`lib/guardrails.ts`) that blocks dosing and medication language, and the prompts forbid it. Patterns are worded as "possible links to discuss with your educator".
- **Your data is yours.** Row-level security in the database means a signed-in user can only read and change their own rows. Users cannot change their own plan.

## Architecture: Input → AI → Logic → Action → Output

| Stage | What happens | Who does it |
|---|---|---|
| **Input** | Meal text; glucose entered or imported from CSV; goals in Settings | Human |
| **AI** | Splits meal text into table dishes with counts and confidence; writes the weekly narrative; proposes a day plan (Gemini through OpenRouter) | AI |
| **Logic** | Validates AI output against the table; nutrition maths; meal-to-glucose pairing (before: 45 min before to 10 min after eating; after: 90 to 150 min, nearest 2 hours); weekly stats; rule-based tips and swaps; plan limits; safety filter | Plain code |
| **Action** | User confirms or edits portions and dishes, saves the meal, adds readings, upgrades | Human |
| **Output** | Dashboard, per-meal tips, history, weekly insights, educator report, meal plan | Plain code (plus AI text where marked) |

Stack: Next.js (App Router) on Vercel; Supabase (email login and Postgres); Stripe Checkout (subscriptions); Gemini via OpenRouter.

Key files:
- `lib/` has the engines: `carbs.ts`, `insights.ts`, `pairing.ts`, `stats.ts`, `csv.ts`, `guardrails.ts`, `ai.ts`
- `app/app/` has the signed-in screens
- `app/api/` has `parse-meal`, `insights`, `plan`, `glucose/import` and `stripe/*`
- `supabase/schema.sql` is the database
- `tests/logic.test.ts` has the unit tests

## Run it locally

You need Node.js (LTS). First create the three accounts below (all have free or test modes).

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` (never commit it; git already ignores it):

1. **OpenRouter** (AI): create a key at openrouter.ai and set `OPENROUTER_API_KEY`.
2. **Supabase** (login and data):
   1. Create a project at supabase.com.
   2. Open SQL Editor, paste all of `supabase/schema.sql`, and run it.
   3. Project Settings → API: copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`, the anon (or publishable) key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the service role key into `SUPABASE_SERVICE_ROLE_KEY`. The service role key is secret and server-only.
   4. For quick testing, Authentication → Sign In / Providers → Email, and turn off "Confirm email". Leave it on for real users.
   5. Authentication → URL Configuration: set Site URL to your app URL and add `<your url>/auth/callback` as a redirect URL.
3. **Stripe** (subscriptions, test mode):
   1. In the Stripe dashboard (test mode), create a product "Sugar Saathi Pro" with a recurring monthly price.
   2. Copy the price ID into `STRIPE_PRICE_ID` and the secret key into `STRIPE_SECRET_KEY`. Set `NEXT_PUBLIC_PRO_PRICE_LABEL` to match the price (for example `₹299 / month`).
   3. Add a webhook endpoint `<your url>/api/stripe/webhook` listening for `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`. Locally you can use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
   4. Turn on the customer portal (Settings → Billing → Customer portal) so "Manage billing" works.

Then:

```bash
npm run dev
```

Open http://localhost:3000. Run the unit tests with:

```bash
npx tsx --test tests/logic.test.ts
```

## Deploy to Vercel

Import the repo in Vercel (or run `npx vercel deploy --prod`). Add every variable from `.env.example` under Project Settings → Environment Variables, set `NEXT_PUBLIC_SITE_URL` to the live URL, and redeploy. Point the Stripe webhook and the Supabase redirect URL at the live URL.

## Failure cases and how the screen handles them

| What could go wrong | What the user sees |
|---|---|
| Empty, too-long or non-food meal text | A clear message; no AI call for empty text; "I couldn't find any food in that" for gibberish |
| Dish not in the table | Red "Not in my table, not counted"; the total is labelled partial; nothing is guessed |
| AI picks the wrong dish | Each row shows what you typed beside what it matched, a dropdown to change it, and an amber "Check this" when unsure |
| AI invents a dish id or returns broken data | Code rejects it; the user sees "Couldn't reach the AI, try again" |
| Free daily AI limit reached | A message and an upgrade button |
| AI text that sounds like dosing advice | Blocked by the safety filter; rule-based insights still show |
| CSV that isn't a glucose export, or has bad rows | A clear message; unreadable rows are skipped and counted |
| Impossible glucose values (outside 40 to 600 mg/dL) | Rejected inline |
| Database, payments or AI not configured | A setup notice or a clear error, never a crash |

## Status and known limits

- Logic is covered by unit tests (`tests/logic.test.ts`): nutrition maths, tips, pairing, weekly stats, CSV parsing and the safety filter.
- The signed-in screens, Supabase row-level security and the Stripe flow need your Supabase and Stripe accounts to run, and have not been exercised end to end yet. Expect to find and fix small issues on first run.
- The food table is a **starter set of 52 dishes with approximate values, not verified by a dietitian**. It must be reviewed before real use, and the app says so on screen.
- Glycemic-load ratings and per-meal thresholds are simple starter rules, not clinically validated.
- This is not a medical device. It gives food guidance, not medical advice.
- Not built: direct CGM or meter sync, photo and voice input, regional languages, medication tracking, an educator-side dashboard.
