// Blocks AI text that sounds like dosing or medication advice. Applied to every AI-written string.
const BLOCKED = [
  /\binsulin\b/i,
  /\b(bolus|basal|dosage|dose|doses|dosing)\b/i,
  /\b\d+(\.\d+)?\s*(units?|iu)\b/i,
  /\b(units?)\s+of\b/i,
  /\b(metformin|glipizide|glimepiride|gliclazide|sitagliptin|vildagliptin|dapagliflozin|empagliflozin|semaglutide|tirzepatide|mounjaro|ozempic|wegovy|jardiance|januvia)\b/i,
  /\b(increase|decrease|reduce|raise|lower|adjust|change|skip|stop|start|double|halve)\s+(your\s+|the\s+)?(medication|medicine|tablet|tablets|pill|pills|drug|drugs|injection|injections|dose)/i,
  /\b(take|inject)\s+(your\s+|an?\s+|the\s+)?(extra\s+)?(medication|medicine|tablet|pill|injection|insulin)/i,
];

export function hasDosingAdvice(text: string): boolean {
  return BLOCKED.some((re) => re.test(text));
}

// True when every string is safe to show.
export function allSafe(texts: string[]): boolean {
  return texts.every((t) => !hasDosingAdvice(t));
}
