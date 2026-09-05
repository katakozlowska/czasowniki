import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { verbs, type Verb } from "@/data/verbs";
import { checkAnswer } from "@/lib/check-answer";
import { praise } from "@/lib/text";
import { getSprintBest, recordAnswer, setSprintBest, weightedVerb } from "@/lib/progress";

export const Route = createFileRoute("/sprint")({
  head: () => ({
    meta: [
      { title: "Sprint 60 sekund — Czasowniki" },
      {
        name: "description",
        content:
          "Minuta na jak najwięcej poprawnych form past simple i past participle. Bij swój rekord!",
      },
      { property: "og:title", content: "Sprint 60 sekund — Czasowniki" },
      {
        property: "og:description",
        content: "Szybkie wpisywanie form czasowników nieregularnych na czas. Zapisujemy Twój rekord.",
      },
    ],
  }),
  component: Sprint,
});

const TOTAL = 60;

type Question = { verb: Verb; kind: "past" | "participle" };

function buildQuestion(): Question {
  return { verb: weightedVerb(verbs), kind: Math.random() < 0.5 ? "past" : "participle" };
}

function Sprint() {
  const [state, setState] = useState<"intro" | "running" | "done">("intro");
  const [left, setLeft] = useState(TOTAL);
  const [question, setQuestion] = useState<Question>(() => buildQuestion());
  const [value, setValue] = useState("");
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [best, setBest] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBest(getSprintBest());
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setState("done");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (state !== "done") return;
    setScore((finalScore) => {
      setSprintBest(finalScore);
      setBest(getSprintBest());
      return finalScore;
    });
  }, [state]);

  function start() {
    setScore(0);
    setLeft(TOTAL);
    setValue("");
    setFlash(null);
    setQuestion(buildQuestion());
    setState("running");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function submit() {
    if (state !== "running") return;
    const variants = question.kind === "past" ? question.verb.past : question.verb.participle;
    const ok = checkAnswer(value, variants);
    recordAnswer(question.verb.base, ok);
    if (ok) setScore((prev) => prev + 1);

    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash({ ok, text: ok ? "Dobrze!" : variants.join(" / ") });
    flashTimer.current = setTimeout(() => setFlash(null), 1000);

    setValue("");
    setQuestion(buildQuestion());
  }

  if (state === "done") {
    const record = score >= best && score > 0;
    return (
      <div className="min-h-screen bg-cream text-ink antialiased">
        <div className="mx-auto max-w-md px-5 pt-12 pb-16 text-center">
          <div className="relative mx-auto mt-2 mb-6 size-28">
            <span className="popring absolute inset-0 rounded-full bg-sun" />
            <span className="popin relative grid size-28 place-items-center rounded-full bg-sun font-display text-5xl">
              {record ? "🏆" : "⏱️"}
            </span>
          </div>
          <h1 className="font-display text-4xl leading-none font-semibold">Czas minął!</h1>
          <p className="mt-3 text-sm font-bold text-ink-soft">
            {record ? "Nowy rekord! Świetna robota." : praise(score, 15)}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-[28px] bg-mint p-5 shadow-[0_7px_0_var(--mint-dark)]">
              <p className="text-xs font-extrabold tracking-wide text-cream/80 uppercase">Wynik</p>
              <p className="mt-1 font-display text-5xl leading-none font-semibold text-cream">
                {score}
              </p>
            </div>
            <div className="rounded-[28px] bg-sky p-5 shadow-[0_7px_0_var(--sky-dark)]">
              <p className="text-xs font-extrabold tracking-wide text-cream/80 uppercase">Rekord</p>
              <p className="mt-1 font-display text-5xl leading-none font-semibold text-cream">
                {best}
              </p>
            </div>
          </div>


          <button
            onClick={start}
            className="mt-8 h-16 w-full rounded-2xl bg-coral font-display text-xl font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
          >
            Jeszcze raz
          </button>
          <Link
            to="/"
            className="mt-4 flex h-16 w-full items-center justify-center rounded-2xl bg-paper font-display text-xl font-semibold text-ink shadow-[0_6px_0_var(--ink)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--ink)]"
          >
            Wróć do menu
          </Link>
        </div>
      </div>
    );
  }

  const danger = left <= 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky to-sky-dark antialiased">
      <div className="mx-auto max-w-md px-5 pt-5 pb-14">
        <div className="mb-5 flex items-center justify-between">
          <Link
            to="/"
            className="flex h-11 min-h-11 items-center gap-1 rounded-2xl bg-cream px-3 font-display text-sm font-bold text-coral shadow-[0_4px_0_var(--coral-dark)]"
            aria-label="Wróć do menu"
          >
            ← Menu
          </Link>
          <div className="rounded-full bg-cream/95 px-4 py-2 font-display text-sm font-semibold text-ink-soft shadow-[0_4px_0_rgba(0,0,0,0.15)]">
            Rekord: {best}
          </div>
        </div>

        <div
          className={`mb-6 rounded-[28px] p-5 text-center shadow-[0_8px_0_rgba(0,0,0,0.18)] ${
            danger ? "bg-coral" : "bg-cream"
          }`}
        >
          <p
            className={`text-xs font-extrabold tracking-[0.2em] uppercase ${
              danger ? "text-cream/80" : "text-ink-soft"
            }`}
          >
            Czas
          </p>
          <p
            className={`font-display text-7xl leading-none font-semibold tabular-nums ${
              danger ? "text-cream" : "text-ink"
            }`}
          >
            {left}
          </p>
          <p className={`mt-2 text-sm font-bold ${danger ? "text-cream/90" : "text-ink-soft"}`}>
            Punkty: {score}
          </p>
        </div>

        {state === "intro" ? (
          <div className="rounded-[28px] bg-cream p-6 text-center shadow-[0_8px_0_var(--sky-dark)]">
            <p className="font-display text-2xl font-semibold text-ink">Sprint 60 sekund</p>
            <p className="mt-2 text-sm font-bold text-ink-soft">
              Wpisz formę i naciśnij Enter. Jak najwięcej poprawnych odmian w minutę.
            </p>
            <button
              onClick={start}
              className="mt-6 h-16 w-full rounded-2xl bg-coral font-display text-xl font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
            >
              Start!
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-[28px] bg-cream p-6 text-center shadow-[0_8px_0_var(--sky-dark)]">
              <p className="text-xs font-extrabold tracking-[0.2em] text-ink-soft uppercase">
                {question.kind === "past" ? "Past simple od:" : "Past participle od:"}
              </p>
              <p className="mt-2 font-display text-5xl leading-none font-semibold text-ink">
                {question.verb.base}
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submit();
                }}
              >
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  autoFocus
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onFocus={(event) => {
                    const el = event.currentTarget;
                    setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
                  }}
                  placeholder="wpisz formę…"
                  aria-label="Twoja odpowiedź"
                  className="mt-5 h-16 w-full rounded-2xl bg-paper px-4 text-center font-display text-2xl font-semibold text-ink shadow-[inset_0_3px_0_rgba(0,0,0,0.1)] outline-none focus:ring-4 focus:ring-sun"
                />
                <button
                  type="submit"
                  className="mt-4 h-14 w-full rounded-2xl bg-mint font-display text-lg font-semibold text-cream shadow-[0_6px_0_var(--mint-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--mint-dark)]"
                >
                  Sprawdź (Enter)
                </button>
              </form>
            </div>

            <div className="mt-5 h-16">
              {flash && (
                <div
                  className={`popin rounded-2xl px-4 py-4 text-center font-display text-xl font-semibold text-cream shadow-[0_6px_0_rgba(0,0,0,0.18)] ${
                    flash.ok ? "bg-mint" : "bg-coral"
                  }`}
                >
                  {flash.ok ? "✅ Dobrze!" : `❌ ${flash.text}`}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
