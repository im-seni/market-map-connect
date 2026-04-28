import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface SavedStoresContextValue {
  savedIds: readonly string[];
  isSaved: (storeId: string) => boolean;
  toggleSaved: (storeId: string) => void;
}

const SavedStoresContext = createContext<SavedStoresContextValue | undefined>(undefined);

export function SavedStoresProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { setSavedIds([]); return; }
    supabase
      .from("saved_stores")
      .select("store_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setSavedIds(data?.map((r) => r.store_id) ?? []);
      });
  }, [user?.id]);

  const isSaved = useCallback((storeId: string) => savedIds.includes(storeId), [savedIds]);

  const toggleSaved = useCallback(
    (storeId: string) => {
      if (savedIds.includes(storeId)) {
        setSavedIds((prev) => prev.filter((id) => id !== storeId));
        if (user) {
          supabase.from("saved_stores").delete()
            .eq("user_id", user.id).eq("store_id", storeId)
            .then(({ error }) => { if (error) console.error("[savedStores] delete:", error.message); });
        }
      } else {
        setSavedIds((prev) => [storeId, ...prev]);
        if (user) {
          supabase.from("saved_stores").insert({ user_id: user.id, store_id: storeId })
            .then(({ error }) => { if (error) console.error("[savedStores] insert:", error.message); });
        }
      }
    },
    [user, savedIds],
  );

  const value = useMemo(
    () => ({ savedIds, isSaved, toggleSaved }),
    [savedIds, isSaved, toggleSaved],
  );

  return <SavedStoresContext.Provider value={value}>{children}</SavedStoresContext.Provider>;
}

export function useSavedStores() {
  const ctx = useContext(SavedStoresContext);
  if (!ctx) throw new Error("useSavedStores must be used within SavedStoresProvider");
  return ctx;
}
