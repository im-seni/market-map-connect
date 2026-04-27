import { useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { AppButton } from "@/components/app/AppButton";
import { RewardStampRing } from "@/components/app/RewardStampRing";
import { AppBottomSheet } from "@/components/app/AppBottomSheet";
import { useRewards } from "@/contexts/RewardsContext";
import { REWARD_OPTIONS, STAMPS_PER_CARD } from "@/data/rewards";
import { storeById } from "@/data/stores";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export default function RewardsScreen() {
  const { primary } = useLanguage();
  const { stamps, count, total, canClaim, claimedCount, claim } = useRewards();
  const [pickerOpen, setPickerOpen] = useState(false);

  const slots = Array.from({ length: STAMPS_PER_CARD }, (_, i) => stamps[i]);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />
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
                    : "border border-dashed border-border bg-secondary/40 text-muted-foreground/60",
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
