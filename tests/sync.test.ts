import { test } from "node:test";
import assert from "node:assert/strict";

import { EMPTY_STATE, fromPersisted, mergeReadings, mergeStates, toPersisted, withTombstone, type State } from "../lib/store-core";
import type { MealRow } from "../lib/types";

const meal = (id: string, at: string, text = "dal"): MealRow => ({ id, eaten_at: at, meal_type: "lunch", text, items: [{ typed: text, foodId: "dal", count: 1 }], carbs: 15, fibre: 5, protein: 8, gl: 5 });
const st = (over: Partial<State>): State => ({ ...EMPTY_STATE, ...over });

test("sync: two devices that each added meals end up with both", () => {
  const a = st({ meals: [meal("a1", "2026-10-20T08:00:00Z")], savedAt: "2026-10-20T09:00:00Z" });
  const b = st({ meals: [meal("b1", "2026-10-20T13:00:00Z")], savedAt: "2026-10-20T14:00:00Z" });
  const m = mergeStates(a, b);
  assert.deepEqual(m.meals.map((x) => x.id), ["b1", "a1"]);
  assert.deepEqual(mergeStates(b, a).meals.map((x) => x.id), ["b1", "a1"]); // order of arguments does not matter
});

test("sync: a delete on one device wins over the copy on the other", () => {
  const a = st({ meals: [meal("m1", "2026-10-20T08:00:00Z")], savedAt: "2026-10-20T09:00:00Z" });
  const b = st({ meals: [], tombstones: withTombstone({}, "m1", "2026-10-21T08:00:00Z"), savedAt: "2026-10-21T08:00:00Z" });
  assert.equal(mergeStates(a, b).meals.length, 0);
  assert.equal(mergeStates(b, a).meals.length, 0);
  assert.ok("m1" in mergeStates(a, b).tombstones);
});

test("sync: the same meal edited on both sides keeps the more recent edit", () => {
  const a = st({ meals: [meal("m1", "2026-10-20T08:00:00Z", "dal")], savedAt: "2026-10-20T09:00:00Z" });
  const b = st({ meals: [meal("m1", "2026-10-20T08:00:00Z", "dal and rice")], savedAt: "2026-10-20T10:00:00Z" });
  assert.equal(mergeStates(a, b).meals[0].text, "dal and rice");
  assert.equal(mergeStates(b, a).meals[0].text, "dal and rice");
});

test("sync: settings come from the more recently changed side; checkin keeps the latest", () => {
  const a = st({ profile: { ...EMPTY_STATE.profile, meal_carb_target: 45 }, savedAt: "2026-10-20T09:00:00Z", checkinAt: "2026-10-19T00:00:00Z" });
  const b = st({ profile: { ...EMPTY_STATE.profile, meal_carb_target: 70 }, savedAt: "2026-10-22T09:00:00Z", checkinAt: "2026-10-18T00:00:00Z" });
  const m = mergeStates(a, b);
  assert.equal(m.profile.meal_carb_target, 70);
  assert.equal(m.checkinAt, "2026-10-19T00:00:00Z");
});

test("sync: a brand new device (empty, never saved) takes everything from the cloud copy", () => {
  const cloud = st({ meals: [meal("m1", "2026-10-20T08:00:00Z")], readings: mergeReadings([], [{ measured_at: "2026-10-20T07:50:00Z", value: 112, source: "manual" }]).readings, profile: { ...EMPTY_STATE.profile, meal_carb_target: 50 }, savedAt: "2026-10-20T09:00:00Z" });
  const m = mergeStates(EMPTY_STATE, cloud);
  assert.equal(m.meals.length, 1);
  assert.equal(m.readings.length, 1);
  assert.equal(m.profile.meal_carb_target, 50);
});

test("sync: readings from both sides are combined without duplicates", () => {
  const r1 = mergeReadings([], [{ measured_at: "2026-10-20T07:50:00Z", value: 112, source: "manual" }, { measured_at: "2026-10-20T10:00:00Z", value: 150, source: "manual" }]).readings;
  const r2 = mergeReadings([], [{ measured_at: "2026-10-20T07:50:00Z", value: 112, source: "manual" }, { measured_at: "2026-10-20T12:00:00Z", value: 130, source: "csv" }]).readings;
  assert.equal(mergeStates(st({ readings: r1 }), st({ readings: r2 })).readings.length, 3);
});

test("sync: a deleted recipe takes its 'my dish' with it, a kept one keeps it", () => {
  const food = { id: "my_abcd1", name: "Mom's dal", unit: "serving", carbs: 20, fibre: 5, protein: 9, fat: 4, gi: 30, category: "dal", icon: "🍲", tags: ["mine"] } as const;
  const recipe = { id: "r1", name: "Mom's dal", servings: 4, lines: [{ ingredientId: "toor_dal", amount: 100, unit: "g" as const }], foodId: "my_abcd1", category: "dal" as const, icon: "🍲" };
  const withIt = st({ recipes: [recipe], customFoods: [{ ...food, tags: [...food.tags] }], savedAt: "2026-10-20T09:00:00Z" });
  const kept = mergeStates(withIt, EMPTY_STATE);
  assert.equal(kept.recipes.length, 1);
  assert.equal(kept.customFoods.length, 1);
  const gone = mergeStates(withIt, st({ tombstones: { r1: "2026-10-21T00:00:00Z" }, savedAt: "2026-10-21T00:00:00Z" }));
  assert.equal(gone.recipes.length, 0);
  assert.equal(gone.customFoods.length, 0);
});

test("sync: tombstones and savedAt survive saving and loading, and bad ones are dropped", () => {
  const s = st({ tombstones: { m1: "2026-10-21T00:00:00Z" }, savedAt: "2026-10-21T00:00:00Z" });
  const back = fromPersisted(JSON.parse(JSON.stringify(toPersisted(s))))!;
  assert.deepEqual(back.tombstones, s.tombstones);
  assert.equal(back.savedAt, s.savedAt);
  const dirty = fromPersisted({ ...toPersisted(EMPTY_STATE), tombstones: { ok: "2026-10-21T00:00:00Z", bad: "not a date", "": "2026-10-21T00:00:00Z" }, savedAt: "nope" })!;
  assert.deepEqual(Object.keys(dirty.tombstones), ["ok"]);
  assert.equal(dirty.savedAt, null);
});

test("sync: old backups without the new fields still load", () => {
  const old = { v: 1, meals: [], readings: [], profile: EMPTY_STATE.profile };
  const back = fromPersisted(old)!;
  assert.deepEqual(back.tombstones, {});
  assert.equal(back.savedAt, null);
});

test("sync: the list of deleted ids stays bounded", () => {
  let t: Record<string, string> = {};
  for (let i = 0; i < 700; i++) t = withTombstone(t, `id${i}`, new Date(2026, 0, 1, 0, 0, i).toISOString());
  assert.equal(Object.keys(t).length, 500);
  assert.ok("id699" in t && !("id0" in t));
});
