import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "jemulpo.savedStores.v1";

function loadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

interface SavedStoresContextValue {
  savedIds: readonly string[];
  isSaved: (storeId: string) => boolean;
  toggleSaved: (storeId: string) => void;
}

const SavedStoresContext = createContext<SavedStoresContextValue | undefined>(undefined);

export function SavedStoresProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(() => loadIds());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      /* ignore */
    }
  }, [savedIds]);

  const isSaved = useCallback((storeId: string) => savedIds.includes(storeId), [savedIds]);

  const toggleSaved = useCallback((storeId: string) => {
    setSavedIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [storeId, ...prev.filter((id) => id !== storeId)],
    );
  }, []);

  const value = useMemo(
    () => ({
      savedIds,
      isSaved,
      toggleSaved,
    }),
    [savedIds, isSaved, toggleSaved],
  );

  return (
    <SavedStoresContext.Provider value={value}>{children}</SavedStoresContext.Provider>
  );
}

export function useSavedStores() {
  const ctx = useContext(SavedStoresContext);
  if (!ctx) throw new Error("useSavedStores must be used within SavedStoresProvider");
  return ctx;
}
