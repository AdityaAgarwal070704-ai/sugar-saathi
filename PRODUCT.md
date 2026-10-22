# Sugar Saathi v2: product scope

Decided with the user on 2026-10-22. This expands [MVP_SCOPE.md](MVP_SCOPE.md) into a free web app for Indian adults managing type 2 diabetes.

## Decisions
- **Glucose data:** real readings only, from quick manual entry or CSV import (LibreView-style exports). The app never invents readings. Every meal also gets a glycemic-load estimate from the food table, labelled as an estimate.
- **Accounts:** Google sign-in only, required once configured, with no database (signed cookies). Health data stays in the browser, one slot per account. No cloud sync yet.
- **Plans:** Free forever + a 7-day Pro trial for every new account. Pro is not on sale; the upgrade screen says "coming soon". Pro access can be granted through the `PRO_EMAILS` list. See README.md for the Free vs Pro table and limits.
- **Advice rules:** food guidance only, worded as suggestions to discuss with an educator or doctor. No medication or dose advice.

## Screens
Landing, dashboard, log a meal, history, glucose (add and import), weekly insights, educator report, meal planner, settings (goals, backup and restore).

## What is AI and what is code
- **AI (Gemini via OpenRouter):** split meal text into table dishes; write the weekly narrative from code-computed stats; propose a day plan using only table dishes.
- **Code:** all carb, fibre, protein and glycemic-load maths; meal-to-glucose pairing; stats; tips and swaps; abuse limits; the dosing-language filter on all AI text.

## Out of scope for now
Direct CGM or meter sync, languages other than English and Hindi, medication logging, an educator-side dashboard, native mobile apps.
