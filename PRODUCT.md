# Sugar Saathi v2: product scope

Decided with the user on 2026-10-22. This expands [MVP_SCOPE.md](MVP_SCOPE.md) into a free web app for Indian adults managing type 2 diabetes.

## Decisions
- **Glucose data:** real readings only, from quick manual entry or CSV import (LibreView-style exports). The app never invents readings. Every meal also gets a glycemic-load estimate from the food table, labelled as an estimate.
- **Accounts and storage:** none. Fully free, no sign-up. All data lives in the browser (local storage) with export and restore. Supabase login and a database were built and then removed on 2026-10-22 (see git history, commit "Sugar Saathi v2").
- **Subscription:** deferred. Payments are not built; every user gets every feature, with a per-IP abuse limit on the AI routes. Stripe code was removed (git history).
- **Advice rules:** food guidance only, worded as suggestions to discuss with an educator or doctor. No medication or dose advice.

## Screens
Landing, dashboard, log a meal, history, glucose (add and import), weekly insights, educator report, meal planner, settings (goals, backup and restore).

## What is AI and what is code
- **AI (Gemini via OpenRouter):** split meal text into table dishes; write the weekly narrative from code-computed stats; propose a day plan using only table dishes.
- **Code:** all carb, fibre, protein and glycemic-load maths; meal-to-glucose pairing; stats; tips and swaps; abuse limits; the dosing-language filter on all AI text.

## Out of scope for now
Direct CGM or meter sync, photo and voice input, regional languages, medication logging, an educator-side dashboard, native mobile apps.
