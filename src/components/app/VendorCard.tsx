import type { Store } from "@/data/stores";
import { inferCrowdLevel, getVendorStatus, waitTimeColorClass } from "@/data/stores";
import { CrowdChip, VendorStatusChip } from "@/components/app/StatusChip";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const crowdLabels = {
  low: { ko: "여유", en: "Low" },
  moderate: { ko: "보통", en: "Moderate" },
  busy: { ko: "혼잡", en: "Busy" },
} as const;

const vendorLabels = {
  open: { ko: "영업 중", en: "Open" },
  sold_out: { ko: "품절", en: "Sold Out" },
  closing_soon: { ko: "마감 임박", en: "Closing Soon" },
} as const;

export function VendorCard({
  store,
  onClick,
  className,
}: {
  store: Store;
  onClick?: () => void;
  className?: string;
}) {
  const { primary } = useLanguage();
  const crowd = inferCrowdLevel(store);
  const status = getVendorStatus(store);
  const c = crowdLabels[crowd];
  const v = vendorLabels[status];

  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-card border border-border bg-card p-g4 shadow-elevate-sm transition hover:border-brand-royal/35 active:scale-[0.99]",
        className
      )}
    >
      <div className="flex gap-g3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-chip bg-secondary text-2xl shadow-elevate-sm">
          {store.emoji}
        </div>
        <div className="min-w-0 flex-1 space-y-g2">
          <div>
            <p className="type-body font-semibold text-foreground truncate">
              {primary(store.name, store.nameEn)}
            </p>
            <p className="type-caption text-muted-foreground">
              {primary(store.category, store.categoryEn)}
            </p>
          </div>
          <div className="flex flex-wrap gap-g2">
            <CrowdChip kind={crowd} labelKo={c.ko} labelEn={c.en} />
            <VendorStatusChip kind={status} labelKo={v.ko} labelEn={v.en} />
            {store.hasReward && (
              <span className="inline-flex items-center rounded-pill border border-brand-yellow/45 bg-brand-yellow/20 px-g3 py-g1 type-caption font-semibold text-foreground">
                {primary("스탬프", "Stamp")}
              </span>
            )}
            {store.hasCoupon && (
              <span className="inline-flex items-center rounded-pill border border-brand-pink-soft/55 bg-brand-pink-light/40 px-g3 py-g1 type-caption font-semibold text-foreground">
                {primary("쿠폰", "Coupon")}
              </span>
            )}
          </div>
          <p className="type-caption text-muted-foreground line-clamp-2">
            {primary(store.description, store.descriptionEn)}
          </p>
          <p className={cn("type-caption font-semibold", waitTimeColorClass(store.waitTime))}>
            {primary(`대기 ${store.waitTime}분`, `Wait ${store.waitTime}m`)}
          </p>
        </div>
      </div>
    </Comp>
  );
}
