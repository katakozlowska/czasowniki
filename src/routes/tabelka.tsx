import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { displayForms, verbs, type Verb } from "@/data/verbs";
import { checkAnswer } from "@/lib/check-answer";

import { hardVerbs, recordAnswer, weightedSample } from "@/lib/progress";
import { RoundSummary } from "@/components/round-summary";

export const Route = createFileRoute("/tabelka")({
  head: () => ({
    meta: [
      { title: "Uzupełnij tabelkę — Czasowniki" },
      {
        name: "description",
        content:
          "Wpisz brakujące formy angielskich czasowników nieregularnych: forma podstawowa, past simple, past participle i tłumaczenie.",
      },
      { property: "og:title", content: "Uzupełnij tabelkę — Czasowniki" },
      {
        property: "og:description",
        content: "Dziesięć czasowników do uzupełnienia. Wpisz brakujące formy i sprawdź wynik.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    trudne: search["trudne"] === "1" || search["trudne"] === true ? true : undefined,
  }),
  component: Tabelka,
});

const ROUND = 10;

type FieldKey = "base" | "past" | "participle" | "pl";

const LABELS: Record<FieldKey, string> = {
  base: "Forma podstawowa",
  past: "Past simple",
  participle: "Past participle",
  pl: "Po polsku",
};

const ORDER: FieldKey[] = ["base", "past", "participle", "pl"];

/** Warianty: które pola są podane z góry. */
const GIVEN_SETS: FieldKey[][] = [
  ["base", "pl"],
  ["pl"],
  ["participle", "pl"],
  ["past", "pl"],
];

type Task = {
  verb: Verb;
  given: FieldKey[];
};

function variantsFor(verb: Verb, field: FieldKey): string[] {
  if (field === "base") return [verb.base];
  if (field === "pl") return [verb.pl, ...verb.pl.split(",").map((part) => part.trim())];
  return field === "past" ? verb.past : verb.participle;
}

function shownValue(verb: Verb, field: FieldKey): string {
  if (field === "base") return verb.base;
  if (field === "pl") return verb.pl;
  return displayForms(field === "past" ? verb.past : verb.participle);
}

function buildRound(onlyHard: boolean): Task[] {
  const pool = onlyHard ? hardVerbs() : verbs;
  return weightedSample(Math.min(ROUND, Math.max(pool.length, 1)), pool.length ? pool : verbs)
    .map((verb) => ({
      verb,
      given: GIVEN_SETS[Math.floor(Math.random() * GIVEN_SETS.length)]!,
    }));
}

function Tabelka() {
  const { trudne } = Route.useSearch();
  const onlyHard = trudne === true;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [earned, setEarned] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setTasks(buildRound(onlyHard));
  }, [onlyHard]);

  const finished = tasks.length > 0 && index >= tasks.length;
  const current = tasks[index];

  if (finished) {
    return (
      <RoundSummary
        correct={correctCount}
        total={tasks.length}
        points={earned}
        onRestart={() => {
          setTasks(buildRound(onlyHard));
          setIndex(0);
          setAnswers({});
          setChecked(false);
          setCorrectCount(0);
          setEarned(0);
        }}
      />
    );
  }

  if (!current) {
    return <div className="min-h-screen bg-gradient-to-b from-sky to-sky-dark" />;
  }

  const toFill = ORDER.filter((field) => !current.given.includes(field));

  function check() {
    if (!current || checked) return;
    setChecked(true);
    const allGood = toFill.every((field) =>
      checkAnswer(answers[field] ?? "", variantsFor(current.verb, field)),
    );
    const points = recordAnswer(current.verb.base, allGood);
    setEarned((prev) => prev + points);
    if (allGood) setCorrectCount((prev) => prev + 1);
  }

  function next() {
    setChecked(false);
    setAnswers({});
    inputsRef.current = [];
    setIndex((prev) => prev + 1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky to-sky-dark antialiased">
      <div className="relative mx-auto max-w-md px-5 pt-5 pb-40">
        <div className="mb-3 flex items-center justify-between">
          <Link
            to="/"
            aria-label="Wróć do menu"
            className="grid size-11 place-items-center rounded-2xl bg-cream font-display text-lg font-bold text-sky-dark shadow-[0_4px_0_var(--sky-dark)]"
          >
            ←
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-cream/95 px-4 py-2 shadow-[0_4px_0_rgba(0,0,0,0.15)]">
            <span className="font-display text-sm font-semibold text-ink-soft">Tabelka</span>
            <span className="font-display font-semibold text-sky-dark">
              {index + 1} / {tasks.length}
            </span>
          </div>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-cream/40">
          <div
            className="h-full rounded-full bg-cream transition-all duration-300"
            style={{ width: `${(index / tasks.length) * 100}%` }}
          />
        </div>

        <div className="rounded-[28px] bg-paper p-5 shadow-[0_8px_0_var(--ink)]">
          <p className="mb-4 text-xs font-extrabold tracking-wide text-ink-soft uppercase">
            Uzupełnij brakujące pola
          </p>

          <div className="space-y-4">
            {ORDER.map((field) => {
              const given = current.given.includes(field);
              const value = answers[field] ?? "";
              const ok = checked && checkAnswer(value, variantsFor(current.verb, field));
              const bad = checked && !ok;
              const fillIndex = toFill.indexOf(field);
              const isLast = fillIndex === toFill.length - 1;

              return (
                <div key={field}>
                  <label className="mb-1 block text-xs font-extrabold text-ink-soft">
                    {LABELS[field]}
                  </label>

                  {given ? (
                    <div className="flex h-14 items-center rounded-2xl bg-sun px-4 font-display text-xl font-semibold text-ink shadow-[0_4px_0_var(--sun-dark)]">
                      {shownValue(current.verb, field)}
                    </div>
                  ) : (
                    <>
                      <input
                        ref={(el) => {
                          inputsRef.current[fillIndex] = el;
                        }}
                        value={value}
                        onChange={(event) =>
                          setAnswers((prev) => ({ ...prev, [field]: event.target.value }))
                        }
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          if (isLast || checked) check();
                          else inputsRef.current[fillIndex + 1]?.focus();
                        }}
                        readOnly={checked}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        enterKeyHint={isLast ? "done" : "next"}
                        placeholder={field === "pl" ? "po polsku…" : "wpisz…"}
                        className={`h-14 w-full rounded-2xl px-4 font-display text-xl font-semibold text-ink outline-none ${
                          ok
                            ? "bg-mint/25 ring-4 ring-mint"
                            : bad
                              ? "bg-coral/20 ring-4 ring-coral"
                              : "bg-cream ring-2 ring-ink/10 focus:ring-4 focus:ring-sky"
                        }`}
                      />
                      {bad && (
                        <p className="mt-1 text-sm font-bold text-coral-dark">
                          Poprawnie: {shownValue(current.verb, field)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-4 mt-6">
          {checked ? (
            <button
              onClick={next}
              className="h-16 w-full rounded-2xl bg-mint font-display text-lg font-semibold text-cream shadow-[0_6px_0_var(--mint-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--mint-dark)]"
            >
              Dalej
            </button>
          ) : (
            <button
              onClick={check}
              className="h-16 w-full rounded-2xl bg-coral font-display text-lg font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
            >
              Sprawdź
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
