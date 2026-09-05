import { verbs, type Verb } from "@/data/verbs";
import { checkAnswer } from "@/lib/check-answer";

const VOWELS = "aeiou";

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** forma podstawowa + -ed (goed, buyed, cuted) */
function regularEd(base: string): string {
  return base.endsWith("e") ? `${base}d` : `${base}ed`;
}

/** podwojona ostatnia spółgłoska + -ed (cutted, hitted) */
function doubledEd(base: string): string | null {
  const last = base.slice(-1);
  const beforeLast = base.slice(-2, -1);
  if (!last || VOWELS.includes(last) || "wxy".includes(last)) return null;
  if (!VOWELS.includes(beforeLast)) return null;
  return `${base}${last}ed`;
}

/** zamiana samogłoski w formie poprawnej (cat, cot, drenk, brake) */
function vowelSwaps(form: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < form.length; i++) {
    const ch = form[i]!;
    if (!VOWELS.includes(ch)) continue;
    for (const v of VOWELS) {
      if (v === ch) continue;
      out.push(`${form.slice(0, i)}${v}${form.slice(i + 1)}`);
    }
  }
  return out;
}

/**
 * Realistyczne błędne formy TEGO SAMEGO czasownika, w losowej kolejności.
 * Żadna nie jest równa poprawnemu wariantowi pytanej formy.
 */
export function wrongForms(verb: Verb, kind: "past" | "participle", count: number): string[] {
  const variants = kind === "past" ? verb.past : verb.participle;
  const target = kind === "past" ? verb.past[0]! : verb.participle[0]!;
  const other = kind === "past" ? verb.participle[0]! : verb.past[0]!;

  const groups: string[][] = [
    [regularEd(verb.base)],
    doubledEd(verb.base) ? [doubledEd(verb.base)!] : [],
    [other],
    shuffle([...vowelSwaps(target), ...vowelSwaps(verb.base)]),
    [verb.base],
  ];

  const chosen: string[] = [];
  const isUsable = (form: string) =>
    Boolean(form) &&
    !checkAnswer(form, variants) &&
    !chosen.some((existing) => checkAnswer(form, [existing]));

  // po jednym błędzie z każdej (losowo uporządkowanej) kategorii
  for (const group of shuffle(groups)) {
    if (chosen.length >= count) break;
    const candidate = group.find(isUsable);
    if (candidate) chosen.push(candidate);
  }

  // dopiero na końcu formy innych czasowników
  if (chosen.length < count) {
    const pool = shuffle(
      verbs
        .filter((item) => item.base !== verb.base)
        .flatMap((item) => [item.past[0]!, item.participle[0]!]),
    );
    for (const form of pool) {
      if (chosen.length >= count) break;
      if (isUsable(form)) chosen.push(form);
    }
  }

  return chosen.slice(0, count);
}

export function wrongForm(verb: Verb, kind: "past" | "participle"): string | null {
  return wrongForms(verb, kind, 1)[0] ?? null;
}

export { pick, shuffle };
