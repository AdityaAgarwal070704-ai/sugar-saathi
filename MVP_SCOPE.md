# Sugar Saathi – MVP Scope (reference)

Source: "Sugar Saathi – MVP Scope.docx" (Oct 21, 2026, Aditya Agarwal). Build-relevant parts only; the original has the research, sources and Apify dataset IDs.

## One-liner
Indian adults with type 2 diabetes describe a meal in everyday words ("2 rotis, 1 katori dal"); the app gives a carb estimate they confirm in one tap, pairs it with their glucose readings, and produces a one-page summary for their diabetes educator.

## MVP goal
Prove one journey: type a mixed Indian meal, confirm portions, see it beside the glucose reading it caused.
**Magic moment:** type "2 rotis, 1 katori dal, aloo sabzi" and in under 10 seconds see the carb estimate beside the 2-hour reading. No weighing, no ingredient search.
**Deadline:** Thu 12:30 PM.

## IN – build (3 features)
1. **Describe → confirm:** type a meal in everyday words; Claude splits it into items and portions; one-tap portion edits; carbs from a starter table of ~50 common dishes.
2. **Glucose pairing:** enter pre-meal and 2-hour readings (manual entry); show the meal and its rise together on a timeline.
3. **Educator summary:** one-page shareable view of the week's meals, rises and 2–3 "possible links to discuss".

## OUT – mention, don't build
User accounts/login, CGM or meter sync, photo input, reminders, medication logging.

## LATER (v2)
Photo and voice input in regional languages; CGM sync; full NIN food table; medication and confounder tracking; educator dashboard across patients.

## Who does what (AI vs scripts vs human)
- Describe meal: human.
- Split dish into components + household portions (katori, roti, "half plate"): **Claude**. Output JSON `[{item, portion, unit, confidence}]`.
- Confirm portions: human (user is ground truth).
- Carb calculation: **script only**, from the food table. Claude must never produce carb numbers.
- Glucose entry: human (manual in MVP; CSV import is later/optional).
- Pair meals with readings: **script**, fixed window (pre-meal and +2h).
- Weekly pattern summary: Claude reads script-computed stats plus free-text notes.
- Educator report: fixed layout script + Claude narrative; user decides what to share.

## Architecture / tech stack
- **Vercel:** web app (confirm-portion screen, meal+glucose timeline, shareable educator report).
- **n8n:** webhook from app → Claude → food-table lookup → pair with glucose → store; weekly schedule runs stats → Claude summary → report. Computes average rise per dish; flags low-confidence items for confirmation.
- **Claude:** meal parsing; weekly pattern summary.
- **GitHub:** app code, exported n8n workflows, versioned food table.
- Food table source: open question. Likely India's NIN food composition tables; confirm licence/access. MVP uses a ~50-dish starter table.

## Safety guardrails (must hold)
- Low-confidence items are always shown for confirmation; every item editable. Carbs come only from the table, never from Claude.
- Patterns are phrased as "possible links to discuss", with the supporting meals listed. Educator decides what's real (confounders: alcohol, skipped meals, medication changes).
- No medical advice: prompt and output filter block dosing language (insulin/medication changes); medication questions route to "ask your educator or doctor".
- The app estimates and suggests; users confirm portions; clinicians own treatment decisions.

## Key assumptions to validate (not facts)
3 meals/day; manual logging ~5 min/meal vs ~1 min target; educator prep 30 → 5 min/week; ~109 min/user/week saved. Most are unvalidated.
