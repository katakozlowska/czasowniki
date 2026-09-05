import { verbs, type Verb } from "@/data/verbs";
import { activeProfileId } from "@/lib/profiles";

export type VerbStat = {
  correct: number;
  wrong: number;
  /** ile poprawnych odpowiedzi z rzędu */
  run: number;
};

export type Progress = {
  points: number;
  streak: number;
  lastDay: string;
  sprintBest: number;
  stats: Record<string, VerbStat>;
};

const empty: Progress = { points: 0, streak: 0, lastDay: "", sprintBest: 0, stats: {} };
const emptyStat: VerbStat = { correct: 0, wrong: 0, run: 0 };

function key() {
  const id = activeProfileId();
  return id ? `czasowniki-data-v1:${id}` : null;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("czasowniki-progress-change"));
  }
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return empty;
  const storageKey = key();
  if (!storageKey) return empty;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return empty;
  }
}

export function saveProgress(progress: Progress) {
  const storageKey = key();
  if (typeof window === "undefined" || !storageKey) return;
  window.localStorage.setItem(storageKey, JSON.stringify(progress));
  notifyChange();
}

/** Aktualizuje serię dni po jakiejkolwiek aktywności. */
function withActivity(progress: Progress): Progress {
  const day = today();
  if (progress.lastDay === day) return progress.streak === 0 ? { ...progress, streak: 1 } : progress;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = progress.lastDay === yesterday ? progress.streak + 1 : 1;
  return { ...progress, streak, lastDay: day };
}

export function statOf(progress: Progress, base: string): VerbStat {
  return progress.stats[base] ?? emptyStat;
}

export type Level = "green" | "yellow" | "red";

export function levelOf(stat: VerbStat): Level {
  const total = stat.correct + stat.wrong;
  if (total === 0) return "yellow";
  const ratio = stat.correct / total;
  if (stat.wrong > stat.correct) return "red";
  if (ratio >= 0.8 && stat.correct >= 3) return "green";
  return "yellow";
}

export function percentOf(stat: VerbStat): number {
  const total = stat.correct + stat.wrong;
  if (total === 0) return 0;
  return Math.round((stat.correct / total) * 100);
}

/** Czy czasownik należy do "trudnych" (więcej błędów niż poprawnych). */
export function isHard(stat: VerbStat): boolean {
  return stat.wrong > stat.correct;
}

/**
 * Zapisuje odpowiedź, dolicza punkty (+10, +5 bonus za trudny czasownik)
 * i aktualizuje serię dni. Zwraca liczbę zdobytych punktów.
 */
export function recordAnswer(base: string, ok: boolean): number {
  const progress = loadProgress();
  const before = statOf(progress, base);
  const wasHard = isHard(before);

  const stat: VerbStat = ok
    ? { correct: before.correct + 1, wrong: before.wrong, run: before.run + 1 }
    : { correct: before.correct, wrong: before.wrong + 1, run: 0 };

  const earned = ok ? 10 + (wasHard ? 5 : 0) : 0;

  const next = withActivity({
    ...progress,
    points: progress.points + earned,
    stats: { ...progress.stats, [base]: stat },
  });
  saveProgress(next);
  return earned;
}

/** Odnotowuje aktywność bez odpowiedzi (np. wejście w ćwiczenie). */
export function touchActivity() {
  saveProgress(withActivity(loadProgress()));
}

export function getSprintBest(): number {
  return loadProgress().sprintBest;
}

export function setSprintBest(value: number) {
  const progress = loadProgress();
  if (value <= progress.sprintBest) return;
  saveProgress({ ...progress, sprintBest: value });
}

/* ---------- ważone losowanie ---------- */

export function weightOf(stat: VerbStat): number {
  if (isHard(stat)) return 3;
  if (stat.run >= 5) return 1 / 3;
  return 1;
}

function weights(pool: Verb[], progress: Progress): number[] {
  return pool.map((verb) => weightOf(statOf(progress, verb.base)));
}

/** Losuje jeden czasownik z wagami (żaden nigdy nie jest wykluczony). */
export function weightedVerb(pool: Verb[] = verbs): Verb {
  const progress = loadProgress();
  const w = weights(pool, progress);
  const total = w.reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= w[i]!;
    if (roll <= 0) return pool[i]!;
  }
  return pool[pool.length - 1]!;
}

/** Losuje n różnych czasowników z wagami (dopełnia, gdy n > długość puli). */
export function weightedSample(n: number, pool: Verb[] = verbs): Verb[] {
  const progress = loadProgress();
  const remaining = [...pool];
  const w = weights(remaining, progress);
  const out: Verb[] = [];

  while (out.length < n && remaining.length > 0) {
    const total = w.reduce((sum, value) => sum + value, 0);
    let roll = Math.random() * total;
    let index = remaining.length - 1;
    for (let i = 0; i < remaining.length; i++) {
      roll -= w[i]!;
      if (roll <= 0) {
        index = i;
        break;
      }
    }
    out.push(remaining[index]!);
    remaining.splice(index, 1);
    w.splice(index, 1);
  }

  while (out.length < n) out.push(weightedVerb(pool));
  return out;
}

/** Czasowniki oznaczone jako trudne lub "w trakcie". */
export function hardVerbs(): Verb[] {
  const progress = loadProgress();
  return verbs.filter((verb) => levelOf(statOf(progress, verb.base)) !== "green");
}
