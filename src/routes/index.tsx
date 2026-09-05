import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verbs } from "@/data/verbs";
import { loadProgress, type Progress } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Czasowniki — angielskie czasowniki nieregularne" },
      {
        name: "description",
        content:
          "Wesoła aplikacja do nauki angielskich czasowników nieregularnych: fiszki, punkty i seria dni.",
      },
      { property: "og:title", content: "Czasowniki — nauka czasowników nieregularnych" },
      {
        property: "og:description",
        content: "Ucz się angielskich czasowników nieregularnych z fiszkami. Po polsku, na telefon.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [progress, setProgress] = useState<Progress>({ points: 0, streak: 0, lastDay: "" });

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  return (
    <div className="min-h-screen bg-cream text-ink antialiased">
      <section className="relative overflow-hidden">
        <div className="floaty-slow absolute -top-10 -right-12 size-44 rounded-full bg-sun/30" />
        <div className="floaty absolute top-40 -left-16 size-40 rounded-full bg-sky/20" />

        <div className="relative mx-auto max-w-md px-5 pt-6 pb-16">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-coral font-display text-2xl font-bold text-cream shadow-[0_5px_0_var(--coral-dark)]">
                C
              </span>
              <div>
                <h1 className="font-display text-2xl font-semibold leading-none">Czasowniki</h1>
                <p className="mt-1 text-xs font-bold text-ink-soft">Kolekcjonuj czasowniki</p>
              </div>
            </div>
            <span className="grid size-12 place-items-center rounded-full bg-mint font-display text-xl font-bold text-cream shadow-[0_4px_0_var(--mint-dark)]">
              {verbs.length}
            </span>
          </div>

          <div className="mb-9 grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-sun p-4 shadow-[0_6px_0_var(--sun-dark)]">
              <p className="text-xs font-extrabold tracking-wide text-ink/70 uppercase">Punkty</p>
              <p className="mt-1 flex items-center gap-1 font-display text-3xl leading-none font-semibold text-ink">
                {progress.points}
                <span className="mt-1 text-base font-bold">pkt</span>
              </p>
            </div>
            <div className="rounded-3xl bg-sky p-4 shadow-[0_6px_0_var(--sky-dark)]">
              <p className="text-xs font-extrabold tracking-wide text-cream/80 uppercase">
                Seria dni
              </p>
              <p className="mt-1 flex items-center gap-1 font-display text-3xl leading-none font-semibold text-cream">
                <span className="text-2xl">⚡</span>
                {progress.streak}
              </p>
            </div>
          </div>

          <p className="mb-4 font-display text-xl font-semibold">Wybierz ćwiczenie</p>

          <Link
            to="/fiszki"
            className="mb-4 flex items-center gap-4 rounded-[28px] bg-paper p-5 shadow-[0_8px_0_var(--ink)] transition-transform active:translate-y-1 active:shadow-[0_4px_0_var(--ink)]"
          >
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-coral font-display text-2xl font-bold text-cream shadow-[0_5px_0_var(--coral-dark)]">
              F
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-xl leading-tight font-semibold">Fiszki</span>
              <span className="mt-0.5 block text-sm font-bold text-ink-soft">
                Przećwicz {verbs.length} czasowników
              </span>
            </span>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-extrabold text-coral-dark">
              Start
            </span>
          </Link>

          <div className="grid gap-4">
            <Link
              to="/wybierz"
              className="flex items-center gap-4 rounded-[28px] bg-paper p-5 shadow-[0_8px_0_var(--mint-dark)] transition-transform active:translate-y-1 active:shadow-[0_4px_0_var(--mint-dark)]"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-mint font-display text-2xl font-bold text-cream shadow-[0_5px_0_var(--mint-dark)]">
                ABC
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl leading-tight font-semibold">
                  Wybierz odpowiedź
                </span>
                <span className="mt-0.5 block text-sm font-bold text-ink-soft">
                  10 pytań, cztery odpowiedzi
                </span>
              </span>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-extrabold text-mint-dark">
                Start
              </span>
            </Link>

            <Link
              to="/prawda-falsz"
              className="flex items-center gap-4 rounded-[28px] bg-paper p-5 shadow-[0_8px_0_var(--sun-dark)] transition-transform active:translate-y-1 active:shadow-[0_4px_0_var(--sun-dark)]"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-sun font-display text-2xl font-bold text-ink shadow-[0_5px_0_var(--sun-dark)]">
                ✓✗
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl leading-tight font-semibold">
                  Prawda czy fałsz
                </span>
                <span className="mt-0.5 block text-sm font-bold text-ink-soft">
                  10 twierdzeń do oceny
                </span>
              </span>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-extrabold text-sun-dark">
                Start
              </span>
            </Link>

            <div className="relative overflow-hidden rounded-[28px] bg-locked p-4 opacity-90">
              <p className="font-display text-base font-semibold text-ink-soft">Więcej ćwiczeń</p>
              <p className="mt-0.5 text-xs font-bold text-ink-soft/70">Wkrótce</p>
              <span className="absolute right-3 bottom-3 text-lg">🔒</span>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
