import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Gift, QrCode } from "lucide-react";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { CouponCardUi } from "@/components/app/CouponCardUi";
import { AppButton } from "@/components/app/AppButton";
import { RewardStampRing } from "@/components/app/RewardStampRing";
import { type CouponState } from "@/data/coupons";
import { STAMPS_PER_CARD } from "@/data/rewards";
import { useCoupons } from "@/contexts/CouponsContext";
import { useRewards } from "@/contexts/RewardsContext";
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
  const { coupons } = useCoupons();
  const { stamps, count, total, claimedCount } = useRewards();
  const [topTab, setTopTab] = useState<TopTab>("stamps");
  const [subTab, setSubTab] = useState<CouponState>("active");

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
            {list.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-g8 gap-g2">
                <Gift className="h-8 w-8 text-muted-foreground/50" />
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
            <p className="type-body text-muted-foreground mt-g2 text-pretty">
              {primary(
                "스탬프 5개를 모으고 미니 요트 50% 할인 쿠폰을 받아보세요!",
                "Collect 5 stamps and get a 50% off mini yacht coupon!",
              )}
            </p>
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

          <AppButton
            variant="primary"
            className="w-full"
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
          <p className="type-caption text-center text-muted-foreground/90 text-pretty max-w-sm mx-auto">
            {primary(
              "시연: QR 제작기(예: qr.io)에 jemulpo:checkin:demo 를 그대로 넣어 만든 코드를 출력해 두면 적립 테스트가 가능합니다.",
              "Demo: encode jemulpo:checkin:demo in any QR generator, print or show on a second screen, then scan it.",
            )}
          </p>

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
