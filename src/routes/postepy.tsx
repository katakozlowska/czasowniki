import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { displayForms, verbs } from "@/data/verbs";
import {
  levelOf,
  loadProgress,
  percentOf,
  statOf,
  type Level,
  type Progress,
} from "@/lib/progress";

export const Route = createFileRoute("/postepy")({
  head: () => ({
    meta: [
      { title: "Moje postępy — Czasowniki" },
      {
        name: "description",
        content:
          "Zobacz, które angielskie czasowniki nieregularne już umiesz, a które warto jeszcze poćwiczyć.",
      },
      { property: "og:title", content: "Moje postępy — Czasowniki" },
      {
        property: "og:description",
        content: "Kolorowa lista wszystkich czasowników z procentem poprawnych odpowiedzi.",
      },
    ],
  }),
  component: Postepy,
});

const TONE: Record<Level, { dot: string; label: string; text: string }> = {
  green: { dot: "bg-mint", label: "Umiem", text: "text-mint-dark" },
  yellow: { dot: "bg-sun", label: "W trakcie", text: "text-ink-soft" },
  red: { dot: "bg-coral", label: "Trudny", text: "text-coral-dark" },
};

function Postepy() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const rows = verbs.map((verb) => {
    const stat = progress ? statOf(progress, verb.base) : { correct: 0, wrong: 0, run: 0 };
    return { verb, stat, level: levelOf(stat), percent: percentOf(stat) };
  });

  const counts = {
    green: rows.filter((row) => row.level === "green").length,
    yellow: rows.filter((row) => row.level === "yellow").length,
    red: rows.filter((row) => row.level === "red").length,
  };

  return (
    <div className="min-h-screen bg-cream text-ink antialiased">
      <div className="mx-auto max-w-md px-5 pt-5 pb-16">
        <div className="mb-5 flex items-center justify-between">
          <Link
            to="/"
            className="flex h-11 min-h-11 items-center px-3 rounded-2xl bg-paper font-display text-sm font-bold text-coral shadow-[0_4px_0_var(--coral-dark)]"
            aria-label="Wróć do menu"
          >
            ← Menu
          </Link>
          <p className="font-display text-xl font-semibold">Moje postępy</p>
          <span className="size-11" />
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-mint p-3 shadow-[0_5px_0_var(--mint-dark)]">
            <p className="font-display text-2xl font-semibold text-cream">{counts.green}</p>
            <p className="text-[11px] font-extrabold text-cream/80 uppercase">Umiem</p>
          </div>
          <div className="rounded-2xl bg-sun p-3 shadow-[0_5px_0_var(--sun-dark)]">
            <p className="font-display text-2xl font-semibold text-ink">{counts.yellow}</p>
            <p className="text-[11px] font-extrabold text-ink/70 uppercase">W trakcie</p>
          </div>
          <div className="rounded-2xl bg-coral p-3 shadow-[0_5px_0_var(--coral-dark)]">
            <p className="font-display text-2xl font-semibold text-cream">{counts.red}</p>
            <p className="text-[11px] font-extrabold text-cream/80 uppercase">Trudne</p>
          </div>
        </div>

        <div className="grid gap-2">
          {rows.map(({ verb, stat, level, percent }) => (
            <div
              key={verb.base}
              className="flex items-center gap-3 rounded-2xl bg-paper p-3 shadow-[0_4px_0_rgba(0,0,0,0.12)]"
            >
              <span className={`size-4 shrink-0 rounded-full ${TONE[level].dot}`} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight font-semibold">
                  {verb.base} · {displayForms(verb.past)} · {displayForms(verb.participle)}
                </p>
                <p className="text-xs font-bold text-ink-soft">
                  {verb.pl} · {stat.correct + stat.wrong === 0 ? "brak odpowiedzi" : `${TONE[level].label}`}
                </p>
              </div>
              <span className={`font-display text-lg font-semibold ${TONE[level].text}`}>
                {percent}%
              </span>
            </div>
          ))}
        </div>

        <Link
          to="/tabelka"
          search={{ trudne: true }}
          className="mt-7 flex h-16 w-full items-center justify-center rounded-2xl bg-coral font-display text-xl font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
        >
          Ćwicz tylko trudne
        </Link>
      </div>
    </div>
  );
}
