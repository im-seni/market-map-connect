import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

const TOUR_KEY_PREFIX = "rp_tour_done";

// Module-level: persists across component unmount/remount so we detect
// the logout → guest transition even when MainLayout fully remounts.
let _lastSeenUserId: string | null = null;

interface TourStep {
  targetId: string;
  titleKo: string;
  titleEn: string;
  descKo: string;
  descEn: string;
  navigateTo?: string;
  radius: number;
  shape?: "rect";
  rectPad?: number;
}

const STEPS: TourStep[] = [
  {
    targetId: "tab-map",
    titleKo: "지도·다이닝",
    titleEn: "Maps & Dining",
    descKo: "야시장 내 가게 위치와 리뷰 정보를 확인해요.",
    descEn: "Find store locations and read reviews inside the night market.",
    radius: 44,
  },
  {
    targetId: "tab-waiting",
    titleKo: "웨이팅",
    titleEn: "Waiting",
    descKo: "원하는 가게에 줄을 서고, 대기 현황을 실시간으로 확인해요.",
    descEn: "Join the queue and track your wait time in real time.",
    radius: 44,
  },
  {
    targetId: "tab-event",
    titleKo: "이벤트",
    titleEn: "Events",
    descKo: "오늘 야시장의 공연·행사와 유람선 탑승 정보를 확인해요.",
    descEn: "Check today's performances, events, and cruise boarding info.",
    radius: 44,
  },
  {
    targetId: "tab-rewards",
    titleKo: "리워드",
    titleEn: "Rewards",
    descKo: "결제 횟수에 따른 스탬프 수집 현황을 확인해요.",
    descEn: "Track your stamp collection based on your purchases.",
    radius: 44,
  },
  {
    targetId: "qr-scan-btn",
    titleKo: "스탬프 적립",
    titleEn: "Earn stamps",
    descKo: "가맹점 결제 영수증의 QR 코드를 스캔해 스탬프를 적립해요. 5개 모으면 할인 쿠폰 자동 발급!",
    descEn: "Scan the QR on your receipt to earn a stamp. Collect 5 for an automatic discount coupon!",
    navigateTo: "/coupons",
    shape: "rect",
    rectPad: 10,
    radius: 32,
  },
];

export function SpotlightTour() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const { user, loading: authLoading } = useSupabaseAuth();

  const tourKey = authLoading ? null : `${TOUR_KEY_PREFIX}::${user?.id ?? "guest"}`;
  const tourKeyRef = useRef(tourKey);
  tourKeyRef.current = tourKey;

  // Guests → sessionStorage (resets each browser session)
  // Logged-in → localStorage (persists across sessions)
  const storage: Storage = !authLoading && !user ? sessionStorage : localStorage;
  const storageRef = useRef<Storage>(storage);
  storageRef.current = storage;

  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Stable refs so effects don't re-fire when callbacks get new references
  const stepRef = useRef(step);
  stepRef.current = step;

  const findTarget = useCallback((targetId: string): DOMRect | null => {
    const el = document.querySelector(`[data-tour-id="${targetId}"]`);
    return el ? el.getBoundingClientRect() : null;
  }, []);

  const goToStep = useCallback(
    (nextStep: number) => {
      if (nextStep >= STEPS.length) {
        if (tourKeyRef.current) storageRef.current.setItem(tourKeyRef.current, "1");
        setStep(-1);
        setRect(null);
        return;
      }
      const s = STEPS[nextStep]!;
      if (s.navigateTo) navigate(s.navigateTo);
      setStep(nextStep);
      setRect(null);
    },
    [navigate],
  );

  const goToStepRef = useRef(goToStep);
  goToStepRef.current = goToStep;

  const skip = useCallback(() => {
    if (tourKeyRef.current) storageRef.current.setItem(tourKeyRef.current, "1");
    setStep(-1);
    setRect(null);
  }, []);

  // Detect logout using module-level variable that survives component unmount.
  // When we remount as guest after having been logged-in, clear the guest key.
  useEffect(() => {
    if (authLoading) return;
    const currId = user?.id ?? null;
    if (currId === null && _lastSeenUserId !== null) {
      sessionStorage.removeItem(`${TOUR_KEY_PREFIX}::guest`);
    }
    _lastSeenUserId = currId;
  }, [user, authLoading]);

  // Auto-start on first visit (per user/guest scope).
  // Uses refs for goToStep and step so this effect only re-fires when tourKey
  // actually changes (new user / guest scope) — not when navigate re-creates
  // goToStep on a route transition, which was causing mid-tour restarts.
  useEffect(() => {
    if (!tourKey) return;
    if (storageRef.current.getItem(tourKey)) return;
    const t = setTimeout(() => {
      if (stepRef.current >= 0) return; // tour already active, don't restart
      goToStepRef.current(0);
    }, 800);
    return () => clearTimeout(t);
  }, [tourKey]); // goToStep intentionally excluded — accessed via ref

  // Measure target element when step changes
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) return;
    const s = STEPS[step]!;
    let attempts = 0;
    const tryMeasure = () => {
      const r = findTarget(s.targetId);
      if (r) {
        setRect(r);
      } else if (++attempts < 15) {
        setTimeout(tryMeasure, 80);
      }
    };
    const delay = s.navigateTo ? 350 : 60;
    const t = setTimeout(tryMeasure, delay);
    return () => clearTimeout(t);
  }, [step, findTarget]);

  // Re-measure on resize so the spotlight stays on the element
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) return;
    const s = STEPS[step]!;
    const remeasure = () => {
      const r = findTarget(s.targetId);
      if (r) setRect(r);
    };
    window.addEventListener("resize", remeasure);
    return () => window.removeEventListener("resize", remeasure);
  }, [step, findTarget]);

  if (step < 0 || step >= STEPS.length || !rect) return null;

  const s = STEPS[step]!;
  const { radius } = s;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const isRect = s.shape === "rect";
  const pad = s.rectPad ?? 8;

  // Spotlight box dimensions
  const spotLeft = isRect ? rect.left - pad : cx - radius;
  const spotTop = isRect ? rect.top - pad : cy - radius;
  const spotWidth = isRect ? rect.width + pad * 2 : radius * 2;
  const spotHeight = isRect ? rect.height + pad * 2 : radius * 2;
  const spotBorderRadius = isRect ? "12px" : "50%";

  // Tooltip position anchored to spotlight box
  const spotBottom = spotTop + spotHeight;
  const targetInBottomHalf = cy > window.innerHeight * 0.55;
  const tooltipPos: CSSProperties = targetInBottomHalf
    ? { bottom: window.innerHeight - spotTop + 16 }
    : { top: spotBottom + 16 };

  return (
    <>
      <div
        aria-hidden
        style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none" }}
      >
        <div
          style={{
            position: "absolute",
            left: spotLeft,
            top: spotTop,
            width: spotWidth,
            height: spotHeight,
            borderRadius: spotBorderRadius,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.62)",
          }}
        />
      </div>

      <div
        style={{ position: "fixed", inset: 0, zIndex: 9999 }}
        onClick={() => goToStep(step + 1)}
      />

      <div
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(calc(100vw - 2rem), 22rem)",
          zIndex: 10000,
          ...tooltipPos,
        }}
        className="rounded-2xl border border-border bg-card px-5 py-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="type-body font-bold text-foreground">{primary(s.titleKo, s.titleEn)}</p>
          <div className="flex items-center gap-1.5 shrink-0">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goToStep(step - 1)}
                className="flex items-center gap-0.5 type-caption text-muted-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {primary("이전", "Back")}
              </button>
            )}
            <span className="type-caption tabular-nums text-muted-foreground">
              {step > 0 && <span className="mx-1 text-border">|</span>}
              {step + 1}&thinsp;/&thinsp;{STEPS.length}
            </span>
          </div>
        </div>
        <p className="type-caption text-pretty text-muted-foreground">{primary(s.descKo, s.descEn)}</p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={skip}
            className="type-caption text-muted-foreground"
          >
            {primary("건너뛰기", "Skip")}
          </button>
          <button
            type="button"
            onClick={() => goToStep(step + 1)}
            className="ml-auto rounded-pill bg-brand-royal px-4 py-1.5 type-caption font-semibold text-white shadow-elevate-sm"
          >
            {step < STEPS.length - 1 ? primary("다음", "Next") : primary("완료", "Done")}
          </button>
        </div>
      </div>
    </>
  );
}
