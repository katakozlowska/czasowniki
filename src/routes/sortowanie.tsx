import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { displayForms, verbs, type Verb } from "@/data/verbs";

import { recordAnswer, weightedSample } from "@/lib/progress";
import { RoundSummary } from "@/components/round-summary";

export const Route = createFileRoute("/sortowanie")({
  head: () => ({
    meta: [
      { title: "Sortowanie — Czasowniki" },
      {
        name: "description",
        content:
          "Wrzuć angielski czasownik nieregularny do właściwego koszyka: wszystkie trzy formy takie same, druga i trzecia takie same albo wszystkie różne.",
      },
      { property: "og:title", content: "Sortowanie — Czasowniki" },
      {
        property: "og:description",
        content: "Ćwiczenie bez wpisywania: jedno kliknięcie i sprawdzasz, czy dobrze posortowałeś.",
      },
    ],
  }),
  component: Sortowanie,
});

type Bucket = "same3" | "same23" | "diff";

const BUCKETS: { key: Bucket; label: string; hint: string; color: string; shadow: string }[] = [
  {
    key: "same3",
    label: "Wszystkie 3 takie same",
    hint: "np. cut – cut – cut",
    color: "bg-mint",
    shadow: "shadow-[0_6px_0_var(--mint-dark)] active:shadow-[0_2px_0_var(--mint-dark)]",
  },
  {
    key: "same23",
    label: "2. i 3. takie same",
    hint: "np. buy – bought – bought",
    color: "bg-sky",
    shadow: "shadow-[0_6px_0_var(--sky-dark)] active:shadow-[0_2px_0_var(--sky-dark)]",
  },
  {
    key: "diff",
    label: "Wszystkie różne",
    hint: "np. drink – drank – drunk",
    color: "bg-coral",
    shadow: "shadow-[0_6px_0_var(--coral-dark)] active:shadow-[0_2px_0_var(--coral-dark)]",
  },
];

const BUCKET_NAME: Record<Bucket, string> = {
  same3: "Wszystkie 3 takie same",
  same23: "2. i 3. takie same",
  diff: "Wszystkie różne",
};

function bucketOf(verb: Verb): Bucket {
  const past = verb.past[0]!;
  const participle = verb.participle[0]!;
  if (past === participle && past === verb.base) return "same3";
  if (past === participle) return "same23";
  return "diff";
}

/** come – came – come: 1. i 3. forma są takie same, ale to wyjątek. */
function isException(verb: Verb): boolean {
  return verb.base === verb.participle[0]! && verb.base !== verb.past[0]!;
}

function Sortowanie() {
  const [deck, setDeck] = useState<Verb[]>([]);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<Bucket | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    setDeck(weightedSample(verbs.length));
  }, []);

  const finished = deck.length > 0 && index >= deck.length;
  const current = deck[index];

  if (finished) {
    return (
      <RoundSummary
        correct={correctCount}
        total={deck.length}
        points={earned}
        onRestart={() => {
          setDeck(weightedSample(verbs.length));
          setIndex(0);
          setChoice(null);
          setCorrectCount(0);
          setEarned(0);
        }}
      />
    );
  }

  if (!current) {
    return <div className="min-h-screen bg-gradient-to-b from-mint to-mint-dark" />;
  }

  const answer = bucketOf(current);
  const wasRight = choice === answer;

  function choose(bucket: Bucket) {
    if (choice || !current) return;
    setChoice(bucket);
    const ok = bucket === bucketOf(current);
    const points = recordAnswer(current.base, ok);
    setEarned((prev) => prev + points);
    if (ok) setCorrectCount((prev) => prev + 1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint to-mint-dark antialiased">
      <div className="relative mx-auto max-w-md px-5 pt-5 pb-14">
        <div className="mb-3 flex items-center justify-between">
          <Link
            to="/"
            aria-label="Wróć do menu"
            className="flex h-11 min-h-11 items-center px-3 rounded-2xl bg-cream font-display text-sm font-bold text-mint-dark shadow-[0_4px_0_var(--mint-dark)]"
          >
            ← Menu
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-cream/95 px-4 py-2 shadow-[0_4px_0_rgba(0,0,0,0.15)]">
            <span className="font-display text-sm font-semibold text-ink-soft">Sortowanie</span>
            <span className="font-display font-semibold text-mint-dark">
              {index + 1} / {deck.length}
            </span>
          </div>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-cream/40">
          <div
            className="h-full rounded-full bg-cream transition-all duration-300"
            style={{ width: `${(index / deck.length) * 100}%` }}
          />
        </div>

        <div className="rounded-[28px] bg-paper p-6 text-center shadow-[0_8px_0_var(--ink)]">
          <p className="text-xs font-extrabold tracking-wide text-ink-soft uppercase">Czasownik</p>
          <p className="mt-2 font-display text-5xl leading-none font-semibold text-ink">
            {current.base}
          </p>
          <p className="mt-2 text-sm font-bold text-ink-soft">{current.pl}</p>
        </div>

        <div className="mt-6 grid gap-4">
          {BUCKETS.map((bucket) => {
            const isAnswer = bucket.key === answer;
            const picked = choice === bucket.key;
            let tone = `${bucket.color} text-cream ${bucket.shadow}`;
            if (choice) {
              if (isAnswer) tone = "bg-mint text-cream shadow-[0_6px_0_var(--mint-dark)]";
              else if (picked) tone = "bg-coral text-cream shadow-[0_6px_0_var(--coral-dark)]";
              else tone = "bg-locked text-ink-soft shadow-[0_6px_0_rgba(0,0,0,0.1)]";
            }
            return (
              <button
                key={bucket.key}
                onClick={() => choose(bucket.key)}
                disabled={Boolean(choice)}
                className={`rounded-[28px] px-5 py-4 text-left transition-transform active:translate-y-1 ${tone}`}
              >
                <span className="block font-display text-xl leading-tight font-semibold">
                  {bucket.label}
                </span>
                <span className="mt-0.5 block text-sm font-bold opacity-80">{bucket.hint}</span>
              </button>
            );
          })}
        </div>

        {choice && (
          <div className="mt-6 rounded-[28px] bg-cream p-5 shadow-[0_8px_0_rgba(0,0,0,0.15)]">
            <p className="font-display text-lg font-semibold text-ink">
              {wasRight ? "Dobrze! 🎉" : `Prawie! To koszyk: ${BUCKET_NAME[answer]}`}
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-ink">
              {current.base} – {displayForms(current.past)} – {displayForms(current.participle)}
            </p>
            {isException(current) && (
              <div className="relative mt-4 rounded-2xl bg-sun p-4 shadow-[0_5px_0_var(--sun-dark)]">
                <span className="absolute -top-2 left-6 size-4 rotate-45 bg-sun" />
                <p className="relative text-sm font-bold text-ink">
                  Uwaga, wyjątek! W „{current.base}” pierwsza i trzecia forma są takie same, ale
                  druga jest inna – dlatego to koszyk „Wszystkie różne”.
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setChoice(null);
                setIndex((prev) => prev + 1);
              }}
              className="mt-4 h-14 w-full rounded-2xl bg-coral font-display text-lg font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
            >
              Dalej
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
