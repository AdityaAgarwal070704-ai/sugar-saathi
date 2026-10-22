# Sugar Saathi v2: product scope

Decided with the user on 2026-10-22. This expands [MVP_SCOPE.md](MVP_SCOPE.md) into a subscription web app for Indian adults managing type 2 diabetes.

## Decisions
- **Glucose data:** real readings only, from quick manual entry or CSV import (LibreView-style exports). The app never invents readings. Every meal also gets a glycemic-load estimate from the food table, labelled as an estimate.
- **Accounts and storage:** Supabase email login and Postgres, with row-level security so users only see their own data.
- **Subscription:** deferred. Payments are not built; every signed-in user gets every feature, with fair-use AI caps. The `profiles.plan` column is kept in the database for when Free vs Pro and Stripe are added.
- **Advice rules:** food guidance only, worded as suggestions to discuss with an educator or doctor. No medication or dose advice.

## Plans (planned, not built)
The earlier plan was Free (3 AI logs a day, 7-day history, no CSV import, AI summary, report or planner) versus Pro (everything), billed through Stripe Checkout. That is deferred. See git history (commit "Sugar Saathi v2") for the removed Stripe code.

## Screens
Landing, login, dashboard, log a meal, history, glucose (add and import), weekly insights, educator report, meal planner, settings.

## What is AI and what is code
- **AI (Gemini via OpenRouter):** split meal text into table dishes; write the weekly narrative from code-computed stats; propose a day plan using only table dishes.
- **Code:** all carb, fibre, protein and glycemic-load maths; meal-to-glucose pairing; stats; tips and swaps; plan limits; the dosing-language filter on all AI text.

## Out of scope for now
Direct CGM or meter sync, photo and voice input, regional languages, medication logging, an educator-side dashboard, native mobile apps.
