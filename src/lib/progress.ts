const KEY = "czasowniki-progress-v1";

export type Progress = {
  points: number;
  streak: number;
  lastDay: string;
};

const empty: Progress = { points: 0, streak: 0, lastDay: "" };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return empty;
  }
}

export function saveProgress(progress: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(progress));
}

/** Dolicza punkty i aktualizuje serię dni. */
export function addPoints(points: number): Progress {
  const current = loadProgress();
  const day = today();
  let streak = current.streak;

  if (current.lastDay !== day) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = current.lastDay === yesterday ? current.streak + 1 : 1;
  }
  if (streak === 0) streak = 1;

  const next: Progress = { points: current.points + points, streak, lastDay: day };
  saveProgress(next);
  return next;
}
