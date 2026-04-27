import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Sparkles } from "lucide-react";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { CouponCardUi } from "@/components/app/CouponCardUi";
import { AppButton } from "@/components/app/AppButton";
import { AppBottomSheet } from "@/components/app/AppBottomSheet";
import { RewardStampRing } from "@/components/app/RewardStampRing";
import { type CouponState } from "@/data/coupons";
import { useCoupons } from "@/contexts/CouponsContext";
import { useRewards } from "@/contexts/RewardsContext";
import { REWARD_OPTIONS, STAMPS_PER_CARD } from "@/data/rewards";
import { storeById } from "@/data/stores";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type TopTab = "coupons" | "rewards";

const couponSubTabs: { id: CouponState; ko: string; en: string }[] = [
  { id: "active", ko: "사용 가능", en: "Active" },
  { id: "used", ko: "사용함", en: "Used" },
  { id: "expired", ko: "만료", en: "Expired" },
];

export default function CouponsScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const { coupons } = useCoupons();
  const { stamps, count, total, canClaim, claimedCount, claim } = useRewards();
  const [topTab, setTopTab] = useState<TopTab>("coupons");
  const [subTab, setSubTab] = useState<CouponState>("active");
  const [pickerOpen, setPickerOpen] = useState(false);

  const list = useMemo(() => coupons.filter((c) => c.state === subTab), [coupons, subTab]);
  const slots = Array.from({ length: STAMPS_PER_CARD }, (_, i) => stamps[i]);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />

      {/* Primary Coupons / Rewards segmented tabs */}
      <div className="px-g4 pt-g3 flex gap-g4 border-b border-border bg-card/80 backdrop-blur-sm">
        {(
          [
            { id: "coupons" as const, ko: "쿠폰", en: "Coupons" },
            { id: "rewards" as const, ko: "리워드", en: "Rewards" },
          ]
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
              list.map((c) => (
                <CouponCardUi
                  key={c.id}
                  coupon={c}
                  onUse={c.state === "active" ? () => navigate(`/coupons/${c.id}`) : undefined}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g6">
          <div>
            <h2 className="type-title text-foreground">{primary("리워드", "Rewards")}</h2>
            <p className="type-body text-muted-foreground mt-g2 text-pretty">
              {primary(
                "10번 방문하고 원하는 리워드를 골라보세요",
                "Visit 10 times, then pick your reward",
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

          {canClaim ? (
            <AppButton variant="primary" className="w-full" onClick={() => setPickerOpen(true)}>
              <Gift className="h-5 w-5" />
              {primary("리워드 선택하기", "Choose your reward")}
            </AppButton>
          ) : (
            <p className="type-caption text-center text-muted-foreground px-g4">
              {primary(
                `상점에서 체크인하여 스탬프를 모으세요 · ${total - count}개 남음`,
                `Check in at vendors to collect stamps · ${total - count} to go`,
              )}
            </p>
          )}

          {claimedCount > 0 && (
            <div className="rounded-card border border-border bg-secondary/40 p-g3 flex items-center gap-g2">
              <Sparkles className="h-4 w-4 text-brand-royal shrink-0" />
              <p className="type-caption text-muted-foreground">
                {primary(
                  `지금까지 받은 리워드 ${claimedCount}개`,
                  `${claimedCount} rewards claimed so far`,
                )}
              </p>
            </div>
          )}
        </div>
      )}

      <AppBottomSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={primary("리워드 선택", "Pick your reward")}
      >
        <div className="space-y-g3 pt-g2">
          {REWARD_OPTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                claim(r.id);
                setPickerOpen(false);
                setTopTab("coupons");
                setSubTab("active");
              }}
              className="w-full text-left rounded-card border border-border bg-card p-g4 shadow-elevate-sm hover:shadow-elevate-md transition-[box-shadow]"
            >
              <p className="type-body font-semibold text-foreground">
                {primary(r.titleKo, r.titleEn)}
              </p>
              <p className="type-caption text-muted-foreground mt-g1">
                {primary(`${r.validDays}일간 유효`, `Valid ${r.validDays} days`)}
              </p>
            </button>
          ))}
        </div>
      </AppBottomSheet>
    </div>
  );
}
