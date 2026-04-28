import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface SupabaseAuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  sessionKey: number;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    meta: { display_name: string; marketing_opt_in: boolean },
  ) => Promise<{ error: string | null; taken?: boolean }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);


  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("[signIn] error:", error.message, error.status);
        return { error: error.message };
      }
      await migrateLocalToSupabase(data.user.id, email);
      return { error: null };
    },
    [],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      meta: { display_name: string; marketing_opt_in: boolean },
    ): Promise<{ error: string | null; taken?: boolean }> => {
      // updateUser는 "이메일 변경"으로 처리되어 Confirm email 설정과 무관하게 인증 요구 → 항상 signUp 사용
      // 익명 세션 먼저 종료
      await supabase.auth.signOut();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: meta.display_name, marketing_opt_in: meta.marketing_opt_in },
        },
      });
      if (error) {
        console.error("[signUp] error:", error.message, error.status);
        const taken =
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already been registered");
        return { error: error.message, taken };
      }
      return { error: null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSessionKey((k) => k + 1);
  }, []);

  const deleteAccount = useCallback(async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.rpc("delete_user");
    if (!error) await supabase.auth.signOut();
    return { error: error?.message ?? null };
  }, []);

  const user = session?.user ?? null;
  const isAnonymous = user?.is_anonymous ?? true;

  return (
    <SupabaseAuthContext.Provider
      value={{ session, user, loading, isAnonymous, sessionKey, signIn, signUp, signOut, deleteAccount }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  return ctx;
}

// ── 기존 localStorage 데모 데이터 → Supabase 1회 마이그레이션 ────────
async function migrateLocalToSupabase(userId: string, email: string) {
  const flagKey = `jemulpo.sb_migrated.v1::${userId}`;
  if (localStorage.getItem(flagKey)) return;

  const oldScope = `user:${email}`;

  // stamps + visit_log + claimedCount
  const rawRewards = localStorage.getItem(`jemulpo.rewards.v1::${oldScope}`);
  if (rawRewards) {
    try {
      const r = JSON.parse(rawRewards) as {
        stamps?: { vendorId: string; collectedOn: string; collectedAt: number }[];
        visitLog?: { vendorId: string; collectedOn: string; collectedAt: number }[];
        claimedCount?: number;
      };

      if (Array.isArray(r.stamps) && r.stamps.length > 0) {
        await supabase.from("stamps").upsert(
          r.stamps.map((s) => ({
            user_id: userId,
            vendor_id: s.vendorId,
            collected_on: s.collectedOn,
            collected_at: new Date(s.collectedAt).toISOString(),
          })),
          { onConflict: "user_id,vendor_id,collected_on", ignoreDuplicates: true },
        );
      }

      if (Array.isArray(r.visitLog) && r.visitLog.length > 0) {
        await supabase.from("visit_log").insert(
          r.visitLog.map((v) => ({
            user_id: userId,
            vendor_id: v.vendorId,
            visited_on: v.collectedOn,
            visited_at: new Date(v.collectedAt).toISOString(),
          })),
        );
      }

      if (typeof r.claimedCount === "number" && r.claimedCount > 0) {
        await supabase.from("stamp_cards").upsert(
          { user_id: userId, claimed_count: r.claimedCount },
          { onConflict: "user_id", ignoreDuplicates: true },
        );
      }
    } catch {
      /* ignore migration errors */
    }
  }

  // coupons
  const rawCoupons = localStorage.getItem(`jemulpo.coupons.v1::${oldScope}`);
  if (rawCoupons) {
    try {
      const cs = JSON.parse(rawCoupons) as {
        id: string;
        titleKo: string;
        titleEn: string;
        vendorId: string;
        expiresAt: string;
        state: string;
      }[];
      if (Array.isArray(cs) && cs.length > 0) {
        await supabase.from("coupons").upsert(
          cs.map((c) => ({
            id: /^[0-9a-f-]{36}$/.test(c.id) ? c.id : undefined,
            user_id: userId,
            template_id: c.id.includes("yacht") ? "yacht-50" : c.id,
            vendor_id: c.vendorId,
            title_ko: c.titleKo,
            title_en: c.titleEn,
            expires_at: c.expiresAt,
            state: c.state,
          })),
          { onConflict: "id", ignoreDuplicates: true },
        );
      }
    } catch {
      /* ignore */
    }
  }

  // saved_stores
  const rawSaved = localStorage.getItem(`jemulpo.savedStores.v1::${oldScope}`);
  if (rawSaved) {
    try {
      const ids = JSON.parse(rawSaved) as string[];
      if (Array.isArray(ids) && ids.length > 0) {
        await supabase.from("saved_stores").upsert(
          ids.map((storeId) => ({ user_id: userId, store_id: storeId })),
          { onConflict: "user_id,store_id", ignoreDuplicates: true },
        );
      }
    } catch {
      /* ignore */
    }
  }

  localStorage.setItem(flagKey, "1");
}
