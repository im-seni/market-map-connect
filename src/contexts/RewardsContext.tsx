import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { storeById } from "@/data/stores";
import { STAMPS_PER_CARD, expiryFromNow, toLocalIsoDate, type Stamp, type VisitLogEntry } from "@/data/rewards";
import type { Coupon } from "@/data/coupons";
import { useCoupons } from "@/contexts/CouponsContext";

interface RewardsState {
  stamps: Stamp[];
  claimedCount: number;
  /** 카드가 비워져도 유지 — 방문 기록(스탬프 적립 이력) */
  visitLog: VisitLogEntry[];
}

interface RewardsContextValue {
  stamps: Stamp[];
  count: number;
  total: number;
  claimedCount: number;
  visitLog: VisitLogEntry[];
  hasStampedToday: (vendorId: string) => boolean;
  addStamp: (vendorId: string) => boolean;
}

const STORAGE_KEY = "jemulpo.rewards.v1";

const RewardsContext = createContext<RewardsContextValue | undefined>(undefined);

const MAX_VISIT_LOG = 200;

function loadState(): RewardsState {
  if (typeof window === "undefined") return { stamps: [], claimedCount: 0, visitLog: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { stamps: [], claimedCount: 0, visitLog: [] };
    const parsed = JSON.parse(raw);
    const stamps = Array.isArray(parsed?.stamps) ? parsed.stamps.slice(0, STAMPS_PER_CARD) : [];
    const visitLog: VisitLogEntry[] = Array.isArray(parsed?.visitLog)
      ? parsed.visitLog
          .filter(
            (e: unknown): e is VisitLogEntry =>
              !!e &&
              typeof e === "object" &&
              "vendorId" in e &&
              typeof (e as VisitLogEntry).vendorId === "string" &&
              "collectedOn" in e &&
              typeof (e as VisitLogEntry).collectedOn === "string" &&
              "collectedAt" in e &&
              typeof (e as VisitLogEntry).collectedAt === "number",
          )
          .slice(-MAX_VISIT_LOG)
      : [];
    return {
      stamps,
      claimedCount: typeof parsed?.claimedCount === "number" ? parsed.claimedCount : 0,
      visitLog,
    };
  } catch {
    return { stamps: [], claimedCount: 0, visitLog: [] };
  }
}

function appendVisitLog(
  prev: VisitLogEntry[] | undefined,
  vendorId: string,
  collectedOn: string,
  collectedAt: number,
) {
  return [...(prev ?? []), { vendorId, collectedOn, collectedAt }].slice(-MAX_VISIT_LOG);
}

function issueYachtHalfCoupon(): Coupon {
  return {
    id: `yacht-50-${Date.now()}`,
    titleKo: "팔미도 미니 요트 50% 할인",
    titleEn: "Palmido mini yacht 50% off",
    /** 다이닝 지도「쿠폰 사용 가능」필터 — `stores` id 15 (팔미도 미니 요트)와 연결 */
    vendorId: "15",
    expiresAt: expiryFromNow(30),
    state: "active",
  };
}

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RewardsState>(() => loadState());
  const { addCoupon } = useCoupons();
  const fullCardMigrated = useRef(false);

  /** 로컬에 5/5가 남은 예전 데이터 1회: 쿠폰 지급 후 스탬프 비움(리액트 18 이펙트 2회도 쿠폰 1번) */
  useLayoutEffect(() => {
    if (fullCardMigrated.current) return;
    if (state.stamps.length < STAMPS_PER_CARD) return;
    fullCardMigrated.current = true;
    const c = issueYachtHalfCoupon();
    addCoupon(c);
    setState((prev) => ({
      stamps: [],
      claimedCount: prev.claimedCount + 1,
      visitLog: prev.visitLog ?? [],
    }));
    toast("5개 모두 모았어요! 요트 50% 쿠폰이 쿠폰함에 담겼어요", {
      description: `${c.titleKo} / ${c.titleEn}`,
    });
  }, [state.stamps.length, addCoupon, state.stamps]);

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
      if (state.stamps.length > STAMPS_PER_CARD - 1) {
        toast("스탬프를 먼저 정리해 주세요 · Clear stamp card first", {
          description: "카드가 가득 찼습니다 · Card is full",
        });
        return false;
      }

      const at = Date.now();
      const stamp: Stamp = {
        vendorId,
        collectedOn: today,
        collectedAt: at,
      };
      const nextStamps = [...state.stamps, stamp];

      if (nextStamps.length >= STAMPS_PER_CARD) {
        const c = issueYachtHalfCoupon();
        addCoupon(c);
        setState((prev) => ({
          stamps: [],
          claimedCount: prev.claimedCount + 1,
          visitLog: appendVisitLog(prev.visitLog, vendorId, today, at),
        }));
        const store = storeById(vendorId);
        toast("5개 모두 모았어요! 요트 50% 쿠폰이 쿠폰함에 담겼어요", {
          description: store
            ? `${store.emoji} ${store.name} · ${c.titleKo} / ${c.titleEn}`
            : `${c.titleKo} / ${c.titleEn}`,
        });
        return true;
      }

      setState((prev) => ({
        ...prev,
        stamps: nextStamps,
        visitLog: appendVisitLog(prev.visitLog, vendorId, today, at),
      }));
      const store = storeById(vendorId);
      toast(`스탬프 +1 · +1 stamp (${nextStamps.length}/${STAMPS_PER_CARD})`, {
        description: store ? `${store.emoji} ${store.name}` : undefined,
      });
      return true;
    },
    [state.stamps, addCoupon],
  );

  const value = useMemo<RewardsContextValue>(
    () => ({
      stamps: state.stamps,
      count: state.stamps.length,
      total: STAMPS_PER_CARD,
      claimedCount: state.claimedCount,
      visitLog: state.visitLog ?? [],
      hasStampedToday,
      addStamp,
    }),
    [state, hasStampedToday, addStamp],
  );

  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>;
}

export function useRewards() {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error("useRewards must be used within RewardsProvider");
  return ctx;
}
