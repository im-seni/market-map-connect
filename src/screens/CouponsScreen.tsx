import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoCharacter from "@/assets/logo/character.png";
import { Camera, ChevronDown, ChevronRight, Gift, QrCode } from "lucide-react";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { CouponCardUi } from "@/components/app/CouponCardUi";
import { AppButton } from "@/components/app/AppButton";
import { RewardStampRing } from "@/components/app/RewardStampRing";
import { Skeleton } from "@/components/ui/skeleton";
import { type CouponState } from "@/data/coupons";
import { STAMPS_PER_CARD } from "@/data/rewards";
import { useCoupons } from "@/contexts/CouponsContext";
import { useRewards } from "@/contexts/RewardsContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { storeById } from "@/data/stores";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type TopTab = "stamps" | "coupons";

const couponSubTabs: { id: CouponState; ko: string; en: string }[] = [
  { id: "active", ko: "사용 가능", en: "Active" },
  { id: "used", ko: "사용함", en: "Used" },
  { id: "expired", ko: "만료", en: "Expired" },
];

export default function CouponsScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const { user } = useSupabaseAuth();
  const { coupons, couponsLoading, couponsError, refreshCoupons } = useCoupons();
  const { stamps, count, total, claimedCount } = useRewards();
  const [topTab, setTopTab] = useState<TopTab>("stamps");
  const [subTab, setSubTab] = useState<CouponState>("active");
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (topTab === "coupons") void refreshCoupons();
  }, [topTab, refreshCoupons]);

  const list = useMemo(() => coupons.filter((c) => c.state === subTab), [coupons, subTab]);
  const slots = Array.from({ length: STAMPS_PER_CARD }, (_, i) => stamps[i]);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />

      <div className="px-g4 pt-g3 flex gap-g4 border-b border-border bg-card/80 backdrop-blur-sm">
        {(
          [
            { id: "stamps" as const, ko: "스탬프", en: "Stamps" },
            { id: "coupons" as const, ko: "쿠폰", en: "Coupons" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTopTab(t.id)}
            className={cn(
              "flex-1 pb-g3 pt-g2 type-body font-semibold border-b-2 -mb-px transition-colors",
              topTab === t.id
                ? "border-brand-royal text-brand-royal"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {primary(t.ko, t.en)}
          </button>
        ))}
      </div>

      {topTab === "coupons" ? (
        <>
          <div className="px-g4 pt-g4 flex gap-g2">
            {couponSubTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={cn(
                  "flex-1 h-9 inline-flex items-center justify-center rounded-pill type-caption font-semibold transition-colors",
                  subTab === t.id
                    ? "bg-brand-royal text-white shadow-elevate-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {primary(t.ko, t.en)}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-g4 py-g4 space-y-g3">
            {!user ? (
              <div className="flex flex-col items-center justify-center text-center py-g8 gap-g3">
                <img src={logoCharacter} alt="" aria-hidden className="h-20 w-20 object-contain opacity-70" />
                <p className="type-body text-muted-foreground">
                  {primary("로그인하면 쿠폰을 확인할 수 있어요", "Sign in to see your coupons")}
                </p>
                <AppButton variant="primary" className="mt-g2 w-full" onClick={() => navigate("/auth/login")}>
                  {primary("로그인", "Sign in")}
                </AppButton>
              </div>
            ) : couponsError ? (
              <div className="rounded-card border border-destructive/30 bg-destructive/5 p-g4 space-y-g3">
                <p className="type-caption text-destructive">{couponsError}</p>
                <AppButton variant="secondary" className="w-full" onClick={() => void refreshCoupons()}>
                  {primary("다시 불러오기", "Retry")}
                </AppButton>
              </div>
            ) : couponsLoading && coupons.length === 0 ? (
              <div className="space-y-g3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-card border border-border bg-card p-g4 space-y-g2">
                    <Skeleton className="h-5 w-[min(90%,280px)]" />
                    <Skeleton className="h-4 w-[min(70%,200px)]" />
                  </div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-g8 gap-g3">
                <img src={logoCharacter} alt="" aria-hidden className="h-20 w-20 object-contain opacity-70" />
                <p className="type-body text-muted-foreground">
                  {primary("쿠폰이 없습니다", "No coupons yet")}
                </p>
              </div>
            ) : (
              list.map((c) => <CouponCardUi key={c.id} coupon={c} />)
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g6">
          <div>
            <h2 className="type-title text-foreground">{primary("스탬프", "Stamps")}</h2>
            <div className="mt-g3 overflow-hidden rounded-card border border-border">
              <button
                type="button"
                onClick={() => setShowGuide((v) => !v)}
                className="flex w-full items-center justify-between gap-g2 bg-secondary/30 px-g3 py-g2 text-left"
              >
                <span className="type-caption font-semibold text-foreground">
                  {primary("이용 안내", "How it works")}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                    showGuide && "rotate-180",
                  )}
                />
              </button>
              {showGuide && (
                <div className="flex items-stretch gap-1 px-g3 pb-g3 pt-g2">
                  {(
                    [
                      { titleKo: "QR 스캔", titleEn: "Scan QR", descKo: "가게에서 결제 후 영수증 QR 스캔", descEn: "Pay at vendor, then scan receipt QR" },
                      { titleKo: "5개 완성", titleEn: "Collect 5", descKo: "스탬프 5개 적립 시 쿠폰 획득", descEn: "Earn 5 stamps to unlock a coupon" },
                      { titleKo: "쿠폰 받기", titleEn: "Get coupon", descKo: "획득한 쿠폰은 쿠폰함에서 확인", descEn: "Find your coupon in the Coupons tab" },
                    ] as const
                  ).map((s, i, arr) => (
                    <Fragment key={i}>
                      <div className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-background p-g2 text-center">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-royal text-[10px] font-bold text-white">
                          {i + 1}
                        </div>
                        <p className="text-[11px] font-bold leading-tight text-foreground">
                          {primary(s.titleKo, s.titleEn)}
                        </p>
                        <p className="text-[10px] leading-tight text-muted-foreground">
                          {primary(s.descKo, s.descEn)}
                        </p>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex items-center self-center">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          <RewardStampRing current={count} total={total} />

          <div className="grid grid-cols-5 gap-g2">
            {slots.map((stamp, i) => {
              const filled = !!stamp;
              const store = stamp ? storeById(stamp.vendorId) : undefined;
              return (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-pill flex items-center justify-center text-lg",
                    filled
                      ? "bg-brand-coral/15 border border-brand-coral/40 shadow-elevate-sm"
                      : "border border-dashed border-border bg-secondary/40 text-muted-foreground/60 type-caption",
                  )}
                  title={store?.name ?? `Slot ${i + 1}`}
                >
                  {filled ? store?.emoji ?? "✦" : i + 1}
                </div>
              );
            })}
          </div>

          {user ? (
            <>
              <AppButton
                variant="primary"
                className="w-full"
                data-tour-id="qr-scan-btn"
                onClick={() => navigate("/scan?intent=checkin")}
              >
                <Camera className="h-5 w-5" />
                {primary("스탬프 적립", "Earn a stamp")}
              </AppButton>
              <p className="type-caption text-center text-muted-foreground -mt-2">
                {primary(
                  "카메라 권한이 필요해요. 가맹점에 비치된 QR을 화면에 맞춰 주세요.",
                  "Camera access is required. Point at the vendor’s check-in QR code.",
                )}
              </p>
            </>
          ) : (
            <AppButton
              variant="primary"
              className="w-full"
              data-tour-id="qr-scan-btn"
              onClick={() => navigate("/auth/login")}
            >
              {primary("로그인하고 스탬프 적립하기", "Sign in to earn stamps")}
            </AppButton>
          )}
          {claimedCount > 0 && (
            <div className="rounded-card border border-border bg-secondary/40 p-g3 flex items-center gap-g2">
              <QrCode className="h-4 w-4 text-brand-royal shrink-0" />
              <p className="type-caption text-muted-foreground">
                {primary(
                  `요트 할인 쿠폰을 ${claimedCount}번 받았어요`,
                  `Yacht discount coupon received ${claimedCount} time(s)`,
                )}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
