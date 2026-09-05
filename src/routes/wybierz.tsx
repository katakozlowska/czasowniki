import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verbs, type Verb } from "@/data/verbs";
import { checkAnswer } from "@/lib/check-answer";
import { addPoints } from "@/lib/progress";
import { RoundSummary } from "@/components/round-summary";

export const Route = createFileRoute("/wybierz")({
  head: () => ({
    meta: [
      { title: "Wybierz odpowiedź — Czasowniki" },
      {
        name: "description",
        content:
          "Ćwiczenie ABC: wybierz poprawną formę past simple lub past participle angielskiego czasownika nieregularnego.",
      },
      { property: "og:title", content: "Wybierz odpowiedź — Czasowniki" },
      {
        property: "og:description",
        content: "Dziesięć pytań z czterema odpowiedziami. Sprawdź, ile form już znasz.",
      },
    ],
  }),
  component: WybierzOdpowiedz,
});

const ROUND = 10;

type Question = {
  verb: Verb;
  kind: "past" | "participle";
  correct: string;
  options: string[];
};

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

function buildQuestion(): Question {
  const verb = pick(verbs);
  const kind: "past" | "participle" = Math.random() < 0.5 ? "past" : "participle";
  const variants = kind === "past" ? verb.past : verb.participle;
  const correct = variants.includes("was/were") ? "was/were" : variants[0]!;

  const pool = verbs
    .filter((other) => other.base !== verb.base)
    .flatMap((other) => [other.past[0]!, other.participle[0]!])
    .filter((form) => !checkAnswer(form, variants));

  const distractors: string[] = [];
  for (const form of shuffle(pool)) {
    if (distractors.length === 3) break;
    if (!distractors.includes(form)) distractors.push(form);
  }

  return { verb, kind, correct, options: shuffle([correct, ...distractors]) };
}

function buildRound(): Question[] {
  return Array.from({ length: ROUND }, buildQuestion);
}

function WybierzOdpowiedz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    setQuestions(buildRound());
  }, []);

  const finished = questions.length > 0 && index >= questions.length;
  const current = questions[index];

  useEffect(() => {
    if (finished && correctCount > 0) addPoints(correctCount * 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function choose(option: string) {
    if (chosen || !current) return;
    setChosen(option);
    const variants = current.kind === "past" ? current.verb.past : current.verb.participle;
    if (checkAnswer(option, variants)) setCorrectCount((prev) => prev + 1);
  }

  function next() {
    setChosen(null);
    setIndex((prev) => prev + 1);
  }

  function restart() {
    setQuestions(buildRound());
    setIndex(0);
    setChosen(null);
    setCorrectCount(0);
  }

  if (finished) {
    return (
      <RoundSummary
        correct={correctCount}
        total={questions.length}
        points={correctCount * 10}
        onRestart={restart}
      />
    );
  }

  const variants = current ? (current.kind === "past" ? current.verb.past : current.verb.participle) : [];
  const answered = chosen !== null;
  const wasRight = answered && checkAnswer(chosen, variants);

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint to-mint-dark antialiased">
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
            <span className="font-display text-sm font-semibold text-ink-soft">Wybierz</span>
            <span className="font-display font-semibold text-coral">
              {index + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="mb-8 h-3 overflow-hidden rounded-full bg-cream/40">
          <div
            className="h-full rounded-full bg-sun transition-all duration-300"
            style={{ width: `${(index / ROUND) * 100}%` }}
          />
        </div>

        {current && (
          <>
            <div className="popin mb-6 rounded-[28px] bg-cream p-6 text-center shadow-[0_10px_0_var(--mint-dark)]">
              <p className="text-xs font-extrabold tracking-[0.2em] text-ink-soft uppercase">
                {current.kind === "past" ? "Past simple od:" : "Past participle od:"}
              </p>
              <p className="mt-2 font-display text-5xl leading-none font-semibold text-ink">
                {current.verb.base}
              </p>
              <p className="mt-3 text-sm font-bold text-ink-soft">{current.verb.pl}</p>
            </div>

            <div className="grid gap-3">
              {current.options.map((option) => {
                const isCorrect = checkAnswer(option, variants);
                const isChosen = option === chosen;
                let tone =
                  "bg-cream text-ink shadow-[0_6px_0_rgba(0,0,0,0.15)] active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.15)]";
                if (answered && isCorrect)
                  tone = "bg-mint text-cream shadow-[0_6px_0_var(--mint-dark)]";
                else if (answered && isChosen)
                  tone = "bg-coral text-cream shadow-[0_6px_0_var(--coral-dark)]";
                else if (answered) tone = "bg-cream/70 text-ink-soft shadow-[0_6px_0_rgba(0,0,0,0.1)]";

                return (
                  <button
                    key={option}
                    onClick={() => choose(option)}
                    disabled={answered}
                    className={`h-16 rounded-2xl font-display text-xl font-semibold transition-transform ${tone}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="popin mt-6 rounded-2xl bg-cream/95 px-4 py-4 text-center shadow-[0_6px_0_var(--mint-dark)]">
                <p className="font-display text-lg font-semibold text-ink">
                  {wasRight ? "Brawo! 🎉" : `Poprawnie: ${current.correct}`}
                </p>
                <button
                  onClick={next}
                  className="mt-3 h-14 w-full rounded-2xl bg-coral font-display text-lg font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
                >
                  {index + 1 === questions.length ? "Zobacz wynik" : "Następne pytanie"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
