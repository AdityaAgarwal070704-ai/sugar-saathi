import data from "@/data/foods.json";
import type { Food } from "./types";

// The food table is public reference data, so the browser can use it directly (nutrition maths runs on the device).
export const FOODS = data.foods as Food[];
