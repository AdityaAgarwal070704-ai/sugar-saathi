# Sugar Saathi

A web app for Indian adults managing type 2 diabetes. Free plan forever, plus a 7-day Pro trial for every new account. Describe a meal in everyday words, get an honest carb estimate and practical feedback, and see every meal beside your glucose.

Live app: https://sugar-saathi.vercel.app. Sign in with Google. Your meals and readings stay on your own device.

- Original MVP scope: [MVP_SCOPE.md](MVP_SCOPE.md)
- Current product scope and decisions: [PRODUCT.md](PRODUCT.md)

## Free, trial and Pro

Sign-in is with Google. There is no database: the app remembers you with signed cookies, and your health data stays in your browser.

| | Free (forever) | Pro (7-day trial now, paid later) |
|---|---|---|
| AI-read meals (typing, voice, "your usual") | 8 a day | 60 a day |
| Photo logging | No | Yes |
| Meal report: nutrition, glycemic gauge, plate balance, tips, swaps | Yes | Yes |
| Expected change in your sugar (from your own paired meals) | Locked, with a teaser | Yes |
| Today, routine, walk timer, streak, reminders, Learn, Eating out, Fasting and festivals, Hindi | Yes | Yes |
| Glucose entry and out-of-range safety cards | Yes | Yes |
| Progress | 7-day overview | 30 days, gentle vs spiky dishes, walks, GMI |
| Recipe builder | Manual | Plus "describe it" AI fill |
| AI weekly summary, day meal planner | No | Yes |
| Educator report, WhatsApp share, CSV import | No | Yes |
| Backup, restore, delete my data | Yes | Yes |

Safety is never locked. Pro is **not on sale yet**: after the trial everyone is on Free and the upgrade screen says "coming soon". Cloud sync across devices is planned, not built.

How it works, and its honest limits:
- **The trial is best-effort.** With no database there is nowhere to record who has used a trial. The start date is kept in a signed cookie that survives sign-outs, so clearing browser data (or using another browser) can restart it.
- **Pro-only AI features are enforced on the server** (photo, recipe AI, weekly summary, planner), by the signed login cookie. The free daily cap on AI-read meals is counted in server memory, so it is a good guard, not an exact meter. Pro features that run on your device (the report, 30-day charts and so on) are locked in the interface; a determined person could get around that with browser tools.
- **Grant Pro** to testers by adding their email to `PRO_EMAILS` in Vercel.
- If the Google keys are not set, the app stays open to everyone with every feature, exactly as before accounts existed.

## What it does

- **Log meals in plain words** ("2 rotis, 1 katori dal, aloo sabzi"), then confirm portions in one tap.
- **Nutrition from an Indian food table:** carbs, fibre, protein and glycemic load per meal.
- **Per-meal feedback:** what's good, what could be better, and swaps (for example brown rice for white, with the carbs saved).
- **Glucose:** quick entry or CSV import (LibreView-style, mg/dL or mmol/L). Every meal is automatically paired with its before and 2-hour readings.
- **A daily rhythm:** a Today screen with your carb budget ring, meal slots, a 2-hour sugar check, a 10-minute post-meal walk timer, a routine checklist you define, a gentle streak, an evening wrap-up and a weekly check-in.
- **Phone reminders without a server:** download a calendar file with repeating meal, walk and 2-hour-check alerts, so your phone's own calendar rings.
- **Share with family or your educator:** one tap shares your weekly summary on WhatsApp (or any app) as plain text.
- **Calm safety cards:** a reading outside your own range shows a gentle note to follow your doctor's plan, never treatment instructions.
- **Recipe builder for home-cooked dishes:** list your raw ingredients (or just describe them in your own words), say how many it serves, and get nutrition for one serving. Save it as "my dish" and log it in one tap or by name.
- **Eating out, fasting and festivals:** restaurant dishes compared, a side-by-side dish comparison, vrat, Ramzan and festival ideas, and a sweet budget that shows how many pieces fit.
- **Hindi and English:** switch language in one tap. Hindi covers the daily screens (Today, Log, meal reports and tips, settings, Learn) and all 215 dish names. Voice logging understands Hindi, and typing in Hindi, English or Hinglish works. The Hindi translation is a first version and should be reviewed by a native speaker.
- **Learn:** eleven short lessons in English and Hindi (the balanced thali, roti or rice, fibre and protein, glycemic index and load, labels, why two readings, sweet drinks, eating out, festivals and fasting, sleep and stress, your appointment). Numbers inside them come from the food table.
- **Dashboard, history and weekly insights:** rule-based observations, plus an AI summary of possible links to discuss with your educator.
- **Educator report:** a one-page weekly summary to print or save as PDF.
- **Meal planner:** an AI-proposed day of Indian meals within your carb goal and diet, with every number calculated from the table.
- **Your goals:** set your own per-meal carb goal, glucose range and diet.
- **Backup and restore:** export everything to a file and restore it later.

## Rules the app follows

- **Numbers come from code, not AI.** Carbs, fibre, protein and glycemic load come only from `data/foods.json`. The AI only turns words into dishes, writes the weekly narrative from numbers that were already calculated, and proposes plans using table dishes that code then checks and calculates.
- **Glucose is never invented.** Readings are only what the user enters or imports. The app does not predict glucose.
- **Food guidance only.** No insulin, dose or medication advice. Every piece of AI text goes through a filter (`lib/guardrails.ts`) that blocks dosing and medication language, and the prompts forbid it. Patterns are worded as "possible links to discuss with your educator".
- **Private by design.** There is no health database. Meals, readings and goals live in the browser's local storage on the user's own device, one storage slot per signed-in account. The only things sent to a server are what an AI feature needs (a meal text or photo, a recipe description, or calculated statistics). Your Google name and email live only in a signed cookie. CSV files are read on the device and never uploaded.

## Architecture: Input → AI → Logic → Action → Output

| Stage | What happens | Who does it |
|---|---|---|
| **Input** | Meal text; glucose entered or imported from CSV; goals in Settings | Human |
| **AI** | Splits meal text into table dishes with counts and confidence; writes the weekly narrative; proposes a day plan (Gemini through OpenRouter) | AI |
| **Logic** | Validates AI output against the table; nutrition maths; meal-to-glucose pairing (before: 45 min before to 10 min after eating; after: 90 to 180 min, nearest 2 hours); weekly stats; rule-based tips and swaps; the safety filter | Plain code |
| **Action** | User confirms or edits portions and dishes, saves the meal, adds readings | Human |
| **Output** | Dashboard, per-meal tips, history, weekly insights, educator report, meal plan | Plain code (plus AI text where marked) |

Stack: Next.js (App Router) on Vercel; browser local storage for data; Gemini via OpenRouter for the five AI features (meal text, meal photo, recipe text, weekly summary, day plan). Installable on your phone as an app (PWA).

Key files:
- `lib/` has the engines: `carbs.ts`, `insights.ts`, `pairing.ts`, `stats.ts`, `csv.ts`, `guardrails.ts`, `ai.ts`, and the browser storage layer (`store.ts`, `store-core.ts`)
- `app/app/` has the screens
- `app/api/` has five routes: `parse-meal`, `parse-photo`, `parse-recipe`, `insights` and `plan`
- `data/foods.json` is the food table and `data/ingredients.json` the raw-ingredient table for the recipe builder
- `lib/i18n/` holds the English and Hindi messages (generated from `tools/i18n_table.py` so both always have the same keys); `lib/learn.ts` holds the lessons
- `tests/logic.test.ts` has the unit tests

## Run it locally

You need Node.js (LTS) and an OpenRouter key. Google sign-in is optional while developing.

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in your values (never commit this file; git already ignores it). The only required value is your key from openrouter.ai:

```
OPENROUTER_API_KEY=your-key-here
```

To turn on login, add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `AUTH_SECRET` (see `.env.example` for how to get them). To try Free, trial and Pro without Google, add `AUTH_SECRET` and `AUTH_MOCK=1`: a fake sign-in panel appears on the login page (development only, ignored in production).

Then start the app and open http://localhost:3000:

```bash
npm run dev
```

Run the unit tests with:

```bash
npx tsx --test tests/logic.test.ts
```

## Deploy to Vercel

Import the repo in Vercel (or run `npx vercel deploy --prod`), add `OPENROUTER_API_KEY` (and, for login, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`) under Project Settings → Environment Variables, and redeploy. In Google Cloud, add `https://YOUR-SITE/api/auth/callback` as an authorised redirect URI.

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

- **Data lives in one browser on one device per account.** Clearing browser data or switching device loses it, so use Settings → Export backup. There is no sync.
- The food table is a **starter set of 215 dishes with approximate values, not verified by a dietitian**. It must be reviewed before real use, and the app says so on screen.
- Glycemic-load ratings and per-meal thresholds are simple starter rules, not clinically validated.
- The abuse limit on the AI routes is best-effort (per server instance), not a hard guarantee.
- This is not a medical device. It gives food guidance, not medical advice.
- Not built: accounts and cross-device sync, payments, direct CGM or meter sync, photo and voice input, regional languages, medication tracking, an educator-side dashboard.
