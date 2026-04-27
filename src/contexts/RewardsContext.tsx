import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { storeById } from "@/data/stores";
import {
  STAMPS_PER_CARD,
  expiryFromNow,
  rewardOptionById,
  toLocalIsoDate,
  type Stamp,
} from "@/data/rewards";
import type { Coupon } from "@/data/coupons";
import { useCoupons } from "@/contexts/CouponsContext";

interface RewardsState {
  stamps: Stamp[];
  claimedCount: number;
}

interface RewardsContextValue {
  stamps: Stamp[];
  count: number;
  total: number;
  canClaim: boolean;
  claimedCount: number;
  hasStampedToday: (vendorId: string) => boolean;
  addStamp: (vendorId: string) => boolean;
  claim: (rewardOptionId: string) => Coupon | undefined;
}

const STORAGE_KEY = "jemulpo.rewards.v1";

const RewardsContext = createContext<RewardsContextValue | undefined>(undefined);

function loadState(): RewardsState {
  if (typeof window === "undefined") return { stamps: [], claimedCount: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { stamps: [], claimedCount: 0 };
    const parsed = JSON.parse(raw);
    return {
      stamps: Array.isArray(parsed?.stamps) ? parsed.stamps : [],
      claimedCount: typeof parsed?.claimedCount === "number" ? parsed.claimedCount : 0,
    };
  } catch {
    return { stamps: [], claimedCount: 0 };
  }
}

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RewardsState>(() => loadState());
  const { addCoupon } = useCoupons();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const hasStampedToday = useCallback(
    (vendorId: string) => {
      const today = toLocalIsoDate();
      return state.stamps.some((s) => s.vendorId === vendorId && s.collectedOn === today);
    },
    [state.stamps],
  );

  const addStamp = useCallback<RewardsContextValue["addStamp"]>(
    (vendorId) => {
      const today = toLocalIsoDate();
      const already = state.stamps.some(
        (s) => s.vendorId === vendorId && s.collectedOn === today,
      );
      if (already) {
        const store = storeById(vendorId);
        toast("이미 오늘 적립했어요 · Already stamped today", {
          description: store ? `${store.emoji} ${store.name}` : undefined,
        });
        return false;
      }
      // Cap collection at 10 — user must claim before stamping again.
      if (state.stamps.length >= STAMPS_PER_CARD) {
        toast("스탬프 카드가 가득 찼어요 · Stamp card is full", {
          description: "리워드를 먼저 선택해 주세요 · Claim your reward first",
        });
        return false;
      }
      const stamp: Stamp = {
        vendorId,
        collectedOn: today,
        collectedAt: Date.now(),
      };
      const nextStamps = [...state.stamps, stamp];
      setState((prev) => ({ ...prev, stamps: nextStamps }));
      const store = storeById(vendorId);
      toast(`스탬프 +1 · +1 stamp (${nextStamps.length}/${STAMPS_PER_CARD})`, {
        description: store ? `${store.emoji} ${store.name}` : undefined,
      });
      return true;
    },
    [state.stamps],
  );

  const claim = useCallback<RewardsContextValue["claim"]>(
    (rewardOptionId) => {
      if (state.stamps.length < STAMPS_PER_CARD) return undefined;
      const reward = rewardOptionById(rewardOptionId);
      if (!reward) return undefined;
      const coupon: Coupon = {
        id: `reward-${reward.id}-${Date.now()}`,
        titleKo: reward.titleKo,
        titleEn: reward.titleEn,
        vendorId: "",
        expiresAt: expiryFromNow(reward.validDays),
        state: "active",
      };
      addCoupon(coupon);
      setState((prev) => ({
        stamps: [],
        claimedCount: prev.claimedCount + 1,
      }));
      toast(`리워드를 받았어요! · Reward claimed!`, {
        description: `${reward.titleKo} · ${reward.titleEn}`,
      });
      return coupon;
    },
    [state.stamps.length, addCoupon],
  );

  const value = useMemo<RewardsContextValue>(
    () => ({
      stamps: state.stamps,
      count: state.stamps.length,
      total: STAMPS_PER_CARD,
      canClaim: state.stamps.length >= STAMPS_PER_CARD,
      claimedCount: state.claimedCount,
      hasStampedToday,
      addStamp,
      claim,
    }),
    [state, hasStampedToday, addStamp, claim],
  );

  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>;
}

export function useRewards() {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error("useRewards must be used within RewardsProvider");
  return ctx;
}
