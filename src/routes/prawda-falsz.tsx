import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { displayForms, verbs, type Verb } from "@/data/verbs";
import { checkAnswer } from "@/lib/check-answer";
import { addPoints } from "@/lib/progress";
import { RoundSummary } from "@/components/round-summary";

export const Route = createFileRoute("/prawda-falsz")({
  head: () => ({
    meta: [
      { title: "Prawda czy fałsz — Czasowniki" },
      {
        name: "description",
        content:
          "Oceń, czy podana forma past simple lub past participle angielskiego czasownika nieregularnego jest poprawna.",
      },
      { property: "og:title", content: "Prawda czy fałsz — Czasowniki" },
      {
        property: "og:description",
        content: "Dziesięć twierdzeń o czasownikach nieregularnych. Prawda czy fałsz?",
      },
    ],
  }),
  component: PrawdaFalsz,
});

const ROUND = 10;

type Statement = {
  verb: Verb;
  kind: "past" | "participle";
  shown: string;
  isTrue: boolean;
};

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

/** Realistyczna, ale błędna forma czasownika. */
function fakeForm(verb: Verb, kind: "past" | "participle"): string | null {
  const variants = kind === "past" ? verb.past : verb.participle;
  const candidates: string[] = [];

  // 1) dodanie -ed do formy podstawowej (goed, buyed, hitted)
  const base = verb.base;
  const last = base.slice(-1);
  const beforeLast = base.slice(-2, -1);
  const vowels = "aeiou";
  let regular = `${base}ed`;
  if (last === "e") regular = `${base}d`;
  else if (vowels.includes(beforeLast) && !vowels.includes(last) && !"wxy".includes(last))
    regular = `${base}${last}ed`;
  candidates.push(regular);

  // 2) zamiana past simple i past participle miejscami
  const other = kind === "past" ? verb.participle[0]! : verb.past[0]!;
  candidates.push(other);

  // 3) forma innego czasownika
  const another = pick(verbs.filter((item) => item.base !== verb.base));
  candidates.push(pick([another.past[0]!, another.participle[0]!]));

  const usable = candidates.filter((form) => !checkAnswer(form, variants));
  return usable.length ? pick(usable) : null;
}

function buildStatement(): Statement {
  const verb = pick(verbs);
  const kind: "past" | "participle" = Math.random() < 0.5 ? "past" : "participle";
  const variants = kind === "past" ? verb.past : verb.participle;
  const wantTrue = Math.random() < 0.5;

  if (wantTrue) {
    return { verb, kind, shown: displayForms(variants), isTrue: true };
  }
  const fake = fakeForm(verb, kind);
  if (!fake) return { verb, kind, shown: displayForms(variants), isTrue: true };
  return { verb, kind, shown: fake, isTrue: false };
}

function buildRound(): Statement[] {
  return Array.from({ length: ROUND }, buildStatement);
}

function PrawdaFalsz() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    setStatements(buildRound());
  }, []);

  const finished = statements.length > 0 && index >= statements.length;
  const current = statements[index];

  useEffect(() => {
    if (finished && correctCount > 0) addPoints(correctCount * 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function respond(value: boolean) {
    if (answer !== null || !current) return;
    setAnswer(value);
    if (value === current.isTrue) setCorrectCount((prev) => prev + 1);
  }

  function next() {
    setAnswer(null);
    setIndex((prev) => prev + 1);
  }

  function restart() {
    setStatements(buildRound());
    setIndex(0);
    setAnswer(null);
    setCorrectCount(0);
  }

  if (finished) {
    return (
      <RoundSummary
        correct={correctCount}
        total={statements.length}
        points={correctCount * 10}
        onRestart={restart}
      />
    );
  }

  const answered = answer !== null;
  const wasRight = answered && current && answer === current.isTrue;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sun to-sun-dark antialiased">
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
            <span className="font-display text-sm font-semibold text-ink-soft">Prawda / fałsz</span>
            <span className="font-display font-semibold text-coral">
              {index + 1} / {statements.length}
            </span>
          </div>
        </div>

        <div className="mb-8 h-3 overflow-hidden rounded-full bg-cream/40">
          <div
            className="h-full rounded-full bg-coral transition-all duration-300"
            style={{ width: `${(index / ROUND) * 100}%` }}
          />
        </div>

        {current && (
          <>
            <div className="popin mb-8 rounded-[28px] bg-cream p-6 text-center shadow-[0_10px_0_var(--sun-dark)]">
              <p className="text-xs font-extrabold tracking-[0.2em] text-ink-soft uppercase">
                Czy to prawda?
              </p>
              <p className="mt-3 font-display text-2xl leading-tight font-semibold text-ink">
                {current.kind === "past" ? "Past simple" : "Past participle"} od{" "}
                <span className="text-coral-dark">{current.verb.base}</span> to:{" "}
                <span className="text-sky-dark">{current.shown}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => respond(true)}
                disabled={answered}
                className="h-20 rounded-2xl bg-mint font-display text-2xl font-semibold text-cream shadow-[0_6px_0_var(--mint-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--mint-dark)] disabled:opacity-70"
              >
                PRAWDA
              </button>
              <button
                onClick={() => respond(false)}
                disabled={answered}
                className="h-20 rounded-2xl bg-coral font-display text-2xl font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)] disabled:opacity-70"
              >
                FAŁSZ
              </button>
            </div>

            {answered && (
              <div className="popin mt-6 rounded-2xl bg-cream/95 px-4 py-4 text-center shadow-[0_6px_0_var(--sun-dark)]">
                <p className="font-display text-lg font-semibold text-ink">
                  {wasRight ? "Brawo! 🎉" : "Niestety, nie."}
                </p>
                <p className="mt-1 text-sm font-bold text-ink-soft">
                  {current.kind === "past" ? "Past simple" : "Past participle"} od {current.verb.base}{" "}
                  to:{" "}
                  {displayForms(current.kind === "past" ? current.verb.past : current.verb.participle)}
                </p>
                <button
                  onClick={next}
                  className="mt-3 h-14 w-full rounded-2xl bg-coral font-display text-lg font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
                >
                  {index + 1 === statements.length ? "Zobacz wynik" : "Następne pytanie"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
