import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { displayForms, verbs, type Verb } from "@/data/verbs";
import { addPoints } from "@/lib/progress";

export const Route = createFileRoute("/fiszki")({
  head: () => ({
    meta: [
      { title: "Fiszki — Czasowniki" },
      {
        name: "description",
        content:
          "Fiszki z angielskimi czasownikami nieregularnymi: forma podstawowa, past simple, past participle i tłumaczenie.",
      },
      { property: "og:title", content: "Fiszki — Czasowniki" },
      {
        property: "og:description",
        content: "Odwracaj karty i sprawdzaj, które czasowniki nieregularne już znasz.",
      },
    ],
  }),
  component: Fiszki,
});

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Fiszki() {
  const [deck, setDeck] = useState<Verb[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Verb[]>([]);
  const [unknown, setUnknown] = useState<Verb[]>([]);

  useEffect(() => {
    setDeck(shuffle(verbs));
  }, []);

  const finished = deck.length > 0 && index >= deck.length;
  const current = deck[index];
  const progressPct = deck.length ? Math.round((index / deck.length) * 100) : 0;

  useEffect(() => {
    if (finished && known.length > 0) addPoints(known.length * 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function answer(isKnown: boolean) {
    if (!current) return;
    if (isKnown) setKnown((prev) => [...prev, current]);
    else setUnknown((prev) => [...prev, current]);
    setFlipped(false);
    setIndex((prev) => prev + 1);
  }

  function restart(list: Verb[]) {
    setDeck(shuffle(list));
    setIndex(0);
    setFlipped(false);
    setKnown([]);
    setUnknown([]);
  }

  const pastLabel = useMemo(() => (current ? displayForms(current.past) : ""), [current]);
  const participleLabel = useMemo(
    () => (current ? displayForms(current.participle) : ""),
    [current],
  );

  if (finished) {
    return (
      <div className="min-h-screen bg-cream text-ink antialiased">
        <div className="relative mx-auto max-w-md px-5 pt-12 pb-16 text-center">
          <div className="relative mx-auto mt-2 mb-6 size-28">
            <span className="popring absolute inset-0 rounded-full bg-sun" />
            <span className="popin relative grid size-28 place-items-center rounded-full bg-sun font-display text-5xl">
              🏆
            </span>
          </div>
          <h1 className="mx-auto max-w-[20ch] font-display text-4xl leading-none font-semibold text-balance">
            Świetna robota!
          </h1>
          <p className="mx-auto mt-3 max-w-[32ch] text-sm font-bold text-ink-soft text-pretty">
            Przeszłaś cały zestaw czasowników. Sprawdź, ile już wiesz.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-[28px] bg-mint p-5 shadow-[0_7px_0_var(--mint-dark)]">
              <p className="text-xs font-extrabold tracking-wide text-cream/80 uppercase">Wiem</p>
              <p className="mt-1 font-display text-5xl leading-none font-semibold text-cream">
                {known.length}
              </p>
            </div>
            <div className="rounded-[28px] bg-coral p-5 shadow-[0_7px_0_var(--coral-dark)]">
              <p className="text-xs font-extrabold tracking-wide text-cream/80 uppercase">
                Jeszcze nie
              </p>
              <p className="mt-1 font-display text-5xl leading-none font-semibold text-cream">
                {unknown.length}
              </p>
            </div>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-sun px-4 py-2 shadow-[0_4px_0_var(--sun-dark)]">
            <span className="font-display text-lg font-semibold text-ink">
              +{known.length * 5} pkt
            </span>
          </div>

          <div className="mt-9 space-y-4">
            {unknown.length > 0 && (
              <button
                onClick={() => restart(unknown)}
                className="h-16 w-full rounded-2xl bg-coral font-display text-lg font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
              >
                Powtórz te, których nie wiem
              </button>
            )}
            <Link
              to="/"
              className="flex h-16 w-full items-center justify-center rounded-2xl bg-paper font-display text-lg font-semibold text-ink ring-1 ring-ink/10 shadow-[0_6px_0_rgba(0,0,0,0.1)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.1)]"
            >
              Wróć do menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky to-sky-dark antialiased">
      <div className="relative mx-auto max-w-md px-5 pt-5 pb-14">
        <div className="mb-3 flex items-center justify-between">
          <Link
            to="/"
            className="grid size-11 place-items-center rounded-2xl bg-cream font-display text-lg font-bold text-coral shadow-[0_4px_0_var(--coral-dark)]"
            aria-label="Wróć do menu"
          >
            ←
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-cream/95 px-4 py-2 shadow-[0_4px_0_rgba(0,0,0,0.15)]">
            <span className="font-display text-sm font-semibold text-ink-soft">Fiszki</span>
            <span className="font-display font-semibold text-coral">
              {Math.min(index + 1, deck.length)} / {deck.length}
            </span>
          </div>
        </div>

        <div className="mb-9 h-3 overflow-hidden rounded-full bg-cream/40">
          <div
            className="h-full rounded-full bg-sun transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {current && (
          <>
            <div className="mb-8">
              <p className="mb-3 text-center text-xs font-extrabold tracking-[0.2em] text-cream/70 uppercase">
                Forma podstawowa
              </p>
              <button
                onClick={() => setFlipped((prev) => !prev)}
                className="relative mx-auto block aspect-[4/3] w-full max-w-xs text-left"
                aria-label="Odwróć kartę"
              >
                <span className="absolute inset-0 translate-y-2 rounded-[28px] bg-ink/25" />
                <span className="popin relative flex h-full flex-col items-center justify-center rounded-[28px] bg-cream p-6 text-center shadow-[0_10px_0_var(--sky-dark)]">
                  <span className="mb-3 rounded-full bg-sun/40 px-3 py-1 text-xs font-extrabold text-ink">
                    czasownik
                  </span>
                  <span className="font-display text-5xl leading-none font-semibold text-ink">
                    {current.base}
                  </span>
                  <span className="mt-4 text-sm font-bold text-ink-soft">
                    {flipped ? "Tapnij, aby ukryć" : "Tapnij, aby odwrócić"}
                  </span>
                </span>
              </button>

              {flipped && (
                <div className="popin mx-auto mt-4 max-w-xs rounded-2xl bg-cream/90 px-4 py-3 text-center shadow-[0_6px_0_var(--sky-dark)]">
                  <div className="flex justify-center gap-5 text-center">
                    <div>
                      <p className="text-[10px] font-extrabold tracking-wide text-sky-dark uppercase">
                        Past simple
                      </p>
                      <p className="font-display text-lg font-semibold text-ink">{pastLabel}</p>
                    </div>
                    <div className="w-px bg-ink/15" />
                    <div>
                      <p className="text-[10px] font-extrabold tracking-wide text-coral-dark uppercase">
                        Participle
                      </p>
                      <p className="font-display text-lg font-semibold text-ink">
                        {participleLabel}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-bold text-ink-soft">{current.pl}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => answer(true)}
                className="h-16 rounded-2xl bg-coral font-display text-lg font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
              >
                Wiem
              </button>
              <button
                onClick={() => answer(false)}
                className="h-16 rounded-2xl bg-cream font-display text-lg font-semibold text-ink shadow-[0_6px_0_rgba(0,0,0,0.15)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.15)]"
              >
                Jeszcze nie
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
