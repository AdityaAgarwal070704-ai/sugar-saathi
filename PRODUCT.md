# Sugar Saathi v2: product scope

Decided with the user on 2026-10-22. This expands [MVP_SCOPE.md](MVP_SCOPE.md) into a subscription web app for Indian adults managing type 2 diabetes.

## Decisions
- **Glucose data:** real readings only, from quick manual entry or CSV import (LibreView-style exports). The app never invents readings. Every meal also gets a glycemic-load estimate from the food table, labelled as an estimate.
- **Accounts and storage:** Supabase email login and Postgres, with row-level security so users only see their own data.
- **Subscription:** Free vs Pro. Stripe Checkout in test mode until the user supplies live keys.
- **Advice rules:** food guidance only, worded as suggestions to discuss with an educator or doctor. No medication or dose advice.

## Plans
| | Free | Pro |
|---|---|---|
| AI meal logging | 3 per day | Unlimited |
| History | Last 7 days | Everything |
| Per-meal tips (rule-based) | Yes | Yes |
| Dashboard and glucose pairing | Yes | Yes |
| CSV glucose import | No | Yes |
| Weekly insights with AI narrative | Rule-based only | Plus AI narrative |
| Educator report (print or PDF) | No | Yes |
| AI day meal planner | No | Yes |

## Screens
Landing, pricing, login, dashboard, log a meal, history, glucose (add and import), weekly insights, educator report, meal planner, settings and billing.

## What is AI and what is code
- **AI (Gemini via OpenRouter):** split meal text into table dishes; write the weekly narrative from code-computed stats; propose a day plan using only table dishes.
- **Code:** all carb, fibre, protein and glycemic-load maths; meal-to-glucose pairing; stats; tips and swaps; plan limits; the dosing-language filter on all AI text.

## Out of scope for now
Direct CGM or meter sync, photo and voice input, regional languages, medication logging, an educator-side dashboard, native mobile apps.
