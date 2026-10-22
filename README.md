# Sugar Saathi

Type what you ate in everyday words, check the carb estimate in one tap, and see it beside your glucose rise.

Hackathon MVP. The full scope is in [MVP_SCOPE.md](MVP_SCOPE.md).

## Job to be done

**When** I've eaten a home-cooked Indian meal, **I want to** type what I ate in everyday words and see an estimated carb count next to my glucose rise, **so I can** stop weighing ingredients and have something clear to show my diabetes educator.

**User:** an adult in India with type 2 diabetes who cooks at home without recipes and checks glucose before and 2 hours after meals.

## The 3 tests

1. **Meal to carbs:** I type "2 rotis, 1 katori dal, aloo sabzi", press the button, and within 10 seconds see the items split out with portions and a carb total I can confirm or tweak.
2. **Meal beside glucose:** I enter my pre-meal and 2-hour readings, and the meal shows on a timeline with its carbs and its rise (for example "+62 mg/dL").
3. **Bad input:** gibberish, empty or too-long text, dishes that aren't in the table, and impossible glucose values never break the app and never produce invented numbers.

All three pass in manual runs in the browser (the dev server, with real Gemini calls). First results come back in about 1 to 3 seconds.

## Current workflow → future workflow

| Today (six manual steps, three tools) | With Sugar Saathi |
|---|---|
| 1. Cook by feel | Stays |
| 2. Weigh ingredients, build a recipe in an app, or give up counting | Replaced: describe the meal in words, check the items, confirm |
| 3. Check glucose before and after | Stays; type the two numbers in |
| 4. Write food and glucose in separate notes or spreadsheets | Replaced: one timeline |
| 5. Scroll back to spot patterns | Not built yet (see "Not built") |
| 6. Explain it verbally to the educator | Not built yet (see "Not built") |

## Architecture: Input → AI → Logic → Action → Output

| Stage | What happens | Who does it |
|---|---|---|
| **Input** | The user types the meal text, and later the two glucose numbers. | Human |
| **AI** | Gemini splits the text into items, maps each to a dish in our table, and gives a count, unit and confidence. | AI (1 call) |
| **Logic** | Validates the text; checks the AI reply is well formed and every dish really exists in the table; multiplies table carbs by count; validates glucose numbers; computes rise = 2-hour minus pre-meal. | Plain code |
| **Action** | The user reviews items, changes dishes or portions, removes or adds items, and presses "Confirm meal", then enters the two readings. | Human |
| **Output** | A confirm card with per-item and total carbs, then a timeline row: meal, carbs, readings and rise. | Plain code |

Files:

- `app/page.tsx` is the one main screen.
- `app/api/parse-meal/route.ts` is the server route that calls the AI and checks its reply.
- `components/ConfirmCard.tsx` and `components/Timeline.tsx` are the two main UI pieces.
- `lib/carbs.ts` and `lib/glucose.ts` hold the carb maths and glucose checks.
- `data/foods.json` is the 52-dish starter carb table.

## Where AI is used, what stays human

**AI does one thing:** split the meal text into items. Words like "rajma chawal with a bit of curd", "half plate" and "aloo sabzi" mix spellings, household units (katori, roti, plate) and free word order. A keyword rule would need every phrasing written by hand.

**Plain code does everything else.** Carbs come only from the table, never from the AI. Carb maths, glucose checks, the rise and the checks on the AI's reply must be exact, so they are not AI.

**The human decides:** what they ate, every portion (portion size is the biggest error source, so the user is the ground truth), which dish an item really is, whether to confirm, and both glucose readings. The app shows numbers only and gives no medical or dosing advice.

## Why these tools

- **Next.js** gives one app (screen plus a small server route) that deploys to Vercel. The server route keeps the API key off the browser.
- **Gemini through OpenRouter** (`google/gemini-3.5-flash-lite`, Google's own servers only) is fast and cheap, which suits the under-10-second goal. It's the gateway the project has a key for.
- **A plain JSON table** keeps carb numbers fixed and auditable, so the AI can't invent them.
- **No database, no login** to keep the MVP small. Meals live in the browser page and are lost on refresh.
- The scope doc also mentions n8n; this MVP does the same job in a Next.js route instead, one fewer tool to set up.

## Failure cases and how the screen handles them

| What could go wrong | What the user sees |
|---|---|
| Empty or whitespace text | The button is disabled, with the hint "Type what you ate." |
| Over 300 characters | "Please keep it to one meal (under 300 characters)." |
| Not food ("asdfgh") | "I couldn't find any food in that. Try e.g. 2 rotis, 1 katori dal." |
| Dish not in the table | Red "Not in my table, not counted"; the total is labelled "Partial". If nothing matches: "No carbs to count yet". |
| AI picks the wrong dish | Each row shows what you typed next to what it matched, and a dropdown lets you change it. Low confidence gets an amber "Check this". |
| AI invents a dish id or returns broken data | The code rejects unknown ids (treated as "not in my table") and shows "Couldn't reach the AI, try again." for malformed replies. |
| AI unreachable, bad or missing key, over 15 s | "Couldn't reach the AI, try again." Your text is kept. |
| Food table missing or invalid | "Food table unavailable." Nothing is guessed. |
| Glucose empty, not a number, or outside 40 to 600 mg/dL | Inline message, and the box goes back to the saved value. |

Known gaps: plain "dal" can be matched with high confidence even if it was dal makhani; confirmed meals can't be edited; the carb values are approximate drafts and **not verified by a dietitian** (the screen says so).

## Not built (by design)

Educator summary page and weekly pattern summary, saving between refreshes, a real chart, accounts and login, CGM or meter sync, photo input, reminders, medication logging. See [MVP_SCOPE.md](MVP_SCOPE.md).

## How to run it locally

You need Node.js (LTS) and an OpenRouter API key.

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and replace the placeholder with your key:

```
OPENROUTER_API_KEY=your-key-here
```

Then start the app and open http://localhost:3000:

```bash
npm run dev
```

`.env.local` is ignored by git. Never put the key in code or commit it.

## Deploying

Import the repo in Vercel and add `OPENROUTER_API_KEY` under Project Settings → Environment Variables.
