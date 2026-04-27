import { Clock, Star, Users } from "lucide-react";
import { CrowdChip, VendorStatusChip } from "@/components/app/StatusChip";
import { useLanguage } from "@/i18n/LanguageContext";
import { type Store, inferCrowdLevel, getVendorStatus, waitTimeColorClass } from "@/data/stores";
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

interface Props {
  store: Store;
  onClick: () => void;
}

export function VendorListItem({ store, onClick }: Props) {
  const { primary } = useLanguage();
  const crowd = inferCrowdLevel(store);
  const status = getVendorStatus(store);
  const cl = crowdLabels[crowd];
  const vl = vendorLabels[status];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-card border border-border bg-card p-g3 shadow-elevate-sm transition-shadow hover:shadow-elevate-md active:scale-[0.99] flex gap-g3"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-secondary text-3xl">
        {store.emoji}
      </div>
      <div className="min-w-0 flex-1 space-y-g1">
        <div className="flex items-baseline gap-g2">
          <span className="type-body font-semibold truncate">
            {primary(store.name, store.nameEn)}
          </span>
          <span className="type-caption text-muted-foreground truncate">
            · {primary(store.category, store.categoryEn)}
          </span>
        </div>
        <div className="flex flex-wrap gap-g2">
          <CrowdChip kind={crowd} labelKo={cl.ko} labelEn={cl.en} />
          <VendorStatusChip kind={status} labelKo={vl.ko} labelEn={vl.en} />
        </div>
        <div className="flex items-center gap-g3 type-caption text-muted-foreground tabular-nums">
          <span className={cn("inline-flex items-center gap-1 font-semibold", waitTimeColorClass(store.waitTime))}>
            <Clock className="h-3.5 w-3.5" />
            {store.waitTime}m
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {store.queueCount}
          </span>
          <span className="inline-flex items-center gap-1 text-brand-royal">
            <Star className="h-3.5 w-3.5 fill-brand-royal" />
            {store.rating}
          </span>
        </div>
      </div>
    </button>
  );
}
