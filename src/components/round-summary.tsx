import { Link } from "@tanstack/react-router";

type Props = {
  correct: number;
  total: number;
  points: number;
  onRestart: () => void;
};

export function RoundSummary({ correct, total, points, onRestart }: Props) {
  const wrong = total - correct;

  return (
    <div className="min-h-screen bg-cream text-ink antialiased">
      <div className="relative mx-auto max-w-md px-5 pt-12 pb-16 text-center">
        <div className="relative mx-auto mt-2 mb-6 size-28">
          <span className="popring absolute inset-0 rounded-full bg-sun" />
          <span className="popin relative grid size-28 place-items-center rounded-full bg-sun font-display text-5xl">
            {correct >= total - 1 ? "🏆" : "💪"}
          </span>
        </div>
        <h1 className="mx-auto max-w-[20ch] font-display text-4xl leading-none font-semibold text-balance">
          Koniec rundy!
        </h1>
        <p className="mx-auto mt-3 max-w-[32ch] text-sm font-bold text-ink-soft text-pretty">
          Twój wynik: {correct} z {total} poprawnych odpowiedzi.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-[28px] bg-mint p-5 shadow-[0_7px_0_var(--mint-dark)]">
            <p className="text-xs font-extrabold tracking-wide text-cream/80 uppercase">Dobrze</p>
            <p className="mt-1 font-display text-5xl leading-none font-semibold text-cream">
              {correct}
            </p>
          </div>
          <div className="rounded-[28px] bg-coral p-5 shadow-[0_7px_0_var(--coral-dark)]">
            <p className="text-xs font-extrabold tracking-wide text-cream/80 uppercase">Błędy</p>
            <p className="mt-1 font-display text-5xl leading-none font-semibold text-cream">
              {wrong}
            </p>
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-sun px-4 py-2 shadow-[0_4px_0_var(--sun-dark)]">
          <span className="font-display text-lg font-semibold text-ink">+{points} pkt</span>
        </div>

        <div className="mt-9 space-y-4">
          <button
            onClick={onRestart}
            className="h-16 w-full rounded-2xl bg-coral font-display text-lg font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
          >
            Zagraj jeszcze raz
          </button>
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
