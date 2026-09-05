const KEY = "czasowniki-profiles-v1";

export type Profile = {
  id: string;
  name: string;
  emoji: string;
};

type Store = {
  profiles: Profile[];
  activeId: string | null;
};

const empty: Store = { profiles: [], activeId: null };

export const AVATARS = ["🦊", "🐼", "🐸", "🦄", "🐙", "🦖", "🐝", "🐳", "🦉", "🐨", "🚀", "⭐"];

export function loadStore(): Store {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as Partial<Store>) };
  } catch {
    return empty;
  }
}

function saveStore(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("czasowniki-profile-change"));
}

export function listProfiles(): Profile[] {
  return loadStore().profiles;
}

export function activeProfile(): Profile | null {
  const store = loadStore();
  return store.profiles.find((profile) => profile.id === store.activeId) ?? null;
}

export function activeProfileId(): string | null {
  return activeProfile()?.id ?? null;
}

export function addProfile(name: string, emoji: string): Profile {
  const store = loadStore();
  const profile: Profile = {
    id: `p${Date.now()}${Math.floor(Math.random() * 1000)}`,
    name: name.trim() || "Uczeń",
    emoji,
  };
  saveStore({ profiles: [...store.profiles, profile], activeId: profile.id });
  return profile;
}

export function selectProfile(id: string) {
  const store = loadStore();
  saveStore({ ...store, activeId: id });
}

export function signOutProfile() {
  const store = loadStore();
  saveStore({ ...store, activeId: null });
}

export function removeProfile(id: string) {
  const store = loadStore();
  const profiles = store.profiles.filter((profile) => profile.id !== id);
  saveStore({ profiles, activeId: store.activeId === id ? null : store.activeId });
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(`czasowniki-data-v1:${id}`);
  }
}
