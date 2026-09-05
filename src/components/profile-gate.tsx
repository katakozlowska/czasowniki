import { useEffect, useState, type ReactNode } from "react";
import {
  AVATARS,
  activeProfile,
  addProfile,
  listProfiles,
  selectProfile,
  removeProfile,
  type Profile,
} from "@/lib/profiles";

export function ProfileGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const sync = () => setProfile(activeProfile());
    sync();
    setReady(true);
    window.addEventListener("czasowniki-profile-change", sync);
    return () => window.removeEventListener("czasowniki-profile-change", sync);
  }, []);

  if (!ready) return <div className="min-h-screen bg-cream" />;
  if (!profile) return <ProfilePicker />;
  return <>{children}</>;
}

export function ProfilePicker({ onClose }: { onClose?: () => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(AVATARS[0]!);

  useEffect(() => {
    const list = listProfiles();
    setProfiles(list);
    if (list.length === 0) setAdding(true);
  }, []);

  function create() {
    if (!name.trim()) return;
    addProfile(name, emoji);
    setName("");
    setAdding(false);
    setProfiles(listProfiles());
    onClose?.();
  }

  return (
    <div className="min-h-screen bg-cream text-ink antialiased">
      <div className="mx-auto max-w-md px-5 pt-12 pb-16">
        <h1 className="text-center font-display text-4xl leading-none font-semibold">
          Kto ćwiczy?
        </h1>
        <p className="mt-3 text-center text-sm font-bold text-ink-soft">
          Każdy ma swoje punkty, serię i rekordy.
        </p>

        <div className="mt-8 grid gap-4">
          {profiles.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-[28px] bg-paper p-4 shadow-[0_8px_0_var(--ink)]"
            >
              <button
                onClick={() => {
                  selectProfile(item.id);
                  onClose?.();
                }}
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
              >
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-sun text-3xl shadow-[0_5px_0_var(--sun-dark)]">
                  {item.emoji}
                </span>
                <span className="block truncate font-display text-2xl font-semibold">
                  {item.name}
                </span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Usunąć profil ${item.name} razem z postępami?`)) {
                    removeProfile(item.id);
                    setProfiles(listProfiles());
                  }
                }}
                aria-label={`Usuń profil ${item.name}`}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream text-lg text-ink-soft"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {adding ? (
          <div className="mt-6 rounded-[28px] bg-paper p-5 shadow-[0_8px_0_var(--mint-dark)]">
            <p className="font-display text-xl font-semibold">Nowy profil</p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") create();
              }}
              placeholder="Twoje imię"
              aria-label="Imię"
              maxLength={16}
              className="mt-4 h-14 w-full rounded-2xl bg-cream px-4 font-display text-xl font-semibold text-ink outline-none focus:ring-4 focus:ring-sun"
            />
            <div className="mt-4 grid grid-cols-6 gap-2">
              {AVATARS.map((item) => (
                <button
                  key={item}
                  onClick={() => setEmoji(item)}
                  aria-label={`Awatar ${item}`}
                  className={`grid h-12 place-items-center rounded-xl text-2xl ${
                    emoji === item ? "bg-sun shadow-[0_4px_0_var(--sun-dark)]" : "bg-cream"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              onClick={create}
              className="mt-5 h-16 w-full rounded-2xl bg-coral font-display text-xl font-semibold text-cream shadow-[0_6px_0_var(--coral-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--coral-dark)]"
            >
              Zaczynamy!
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-6 h-16 w-full rounded-2xl bg-mint font-display text-xl font-semibold text-cream shadow-[0_6px_0_var(--mint-dark)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_var(--mint-dark)]"
          >
            + Dodaj profil
          </button>
        )}

        {onClose && profiles.length > 0 && (
          <button
            onClick={onClose}
            className="mt-4 h-14 w-full rounded-2xl bg-paper font-display text-lg font-semibold text-ink shadow-[0_6px_0_var(--ink)]"
          >
            Anuluj
          </button>
        )}
      </div>
    </div>
  );
}
