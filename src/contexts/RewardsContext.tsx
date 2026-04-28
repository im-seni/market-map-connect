import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { storeById } from "@/data/stores";
import { STAMPS_PER_CARD, toLocalIsoDate, type Stamp, type VisitLogEntry } from "@/data/rewards";
import { useCoupons } from "@/contexts/CouponsContext";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface RewardsContextValue {
  stamps: Stamp[];
  count: number;
  total: number;
  claimedCount: number;
  visitLog: VisitLogEntry[];
  hasStampedToday: (vendorId: string) => boolean;
  addStamp: (vendorId: string) => Promise<boolean>;
}

const RewardsContext = createContext<RewardsContextValue | undefined>(undefined);

function dbStampToUi(row: {
  vendor_id: string;
  collected_on: string;
  collected_at: string;
}): Stamp {
  return {
    vendorId: row.vendor_id,
    collectedOn: row.collected_on,
    collectedAt: new Date(row.collected_at).getTime(),
  };
}

function dbVisitToUi(row: {
  vendor_id: string;
  visited_on: string;
  visited_at: string;
}): VisitLogEntry {
  return {
    vendorId: row.vendor_id,
    collectedOn: row.visited_on,
    collectedAt: new Date(row.visited_at).getTime(),
  };
}

export function RewardsProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth();
  const { refreshCoupons } = useCoupons();
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [visitLog, setVisitLog] = useState<VisitLogEntry[]>([]);
  const [claimedCount, setClaimedCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      setStamps([]);
      setVisitLog([]);
      setClaimedCount(0);
      return;
    }
    const uid = user.id;
    Promise.all([
      supabase
        .from("stamps")
        .select("vendor_id, collected_on, collected_at")
        .eq("user_id", uid)
        .order("collected_at", { ascending: false }),
      supabase
        .from("visit_log")
        .select("vendor_id, visited_on, visited_at")
        .eq("user_id", uid)
        .order("visited_at", { ascending: false })
        .limit(200),
      supabase
        .from("stamp_cards")
        .select("claimed_count")
        .eq("user_id", uid)
        .maybeSingle(),
    ]).then(([stampsRes, visitRes, cardRes]) => {
      setStamps(stampsRes.data?.map(dbStampToUi) ?? []);
      setVisitLog(visitRes.data?.map(dbVisitToUi) ?? []);
      setClaimedCount(cardRes.data?.claimed_count ?? 0);
    });
  }, [user?.id, refreshKey]);

  const hasStampedToday = useCallback(
    (vendorId: string) => {
      const today = toLocalIsoDate();
      return stamps.some((s) => s.vendorId === vendorId && s.collectedOn === today);
    },
    [stamps],
  );

  const addStamp = useCallback(
    async (vendorId: string): Promise<boolean> => {
      if (!user) return false;
      const today = toLocalIsoDate();
      const now = new Date().toISOString();

      const { data, error } = await supabase.rpc("claim_stamp", {
        p_vendor_id: vendorId,
        p_collected_on: today,
        p_collected_at: now,
      });

      if (error) {
        if (error.message?.includes("not_authenticated") || error.code === "PGRST301") {
          window.alert("로그인 후 이용 가능합니다.");
        } else {
          toast("오류가 발생했어요 · Something went wrong");
        }
        return false;
      }

      if (!data.ok) {
        if (data.error === "not_authenticated") {
          window.alert("로그인 후 이용 가능합니다.");
          return false;
        }
        if (data.error === "already_stamped_today") {
          const store = storeById(vendorId);
          toast("이미 오늘 적립했어요 · Already stamped today", {
            description: store ? `${store.emoji} ${store.name}` : undefined,
          });
        }
        return false;
      }

      if (data.reward) {
        await refreshCoupons();
        setRefreshKey((k) => k + 1);
        const store = storeById(vendorId);
        toast("5개 모두 모았어요! 요트 50% 쿠폰이 쿠폰함에 담겼어요", {
          description: store
            ? `${store.emoji} ${store.name} · 팔미도 미니 요트 50% 할인`
            : "팔미도 미니 요트 50% 할인",
        });
      } else {
        setRefreshKey((k) => k + 1);
        const store = storeById(vendorId);
        toast(`스탬프 +1 · +1 stamp (${data.stamp_count}/${STAMPS_PER_CARD})`, {
          description: store ? `${store.emoji} ${store.name}` : undefined,
        });
      }

      return true;
    },
    [user, refreshCoupons],
  );

  return (
    <RewardsContext.Provider
      value={{
        stamps,
        count: stamps.length,
        total: STAMPS_PER_CARD,
        claimedCount,
        visitLog,
        hasStampedToday,
        addStamp,
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error("useRewards must be used within RewardsProvider");
  return ctx;
}
