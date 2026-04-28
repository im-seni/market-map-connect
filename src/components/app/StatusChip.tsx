import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type Crowd = "low" | "moderate" | "busy";
type Vendor = "open" | "pre_open" | "closed" | "sold_out";

/* All chips: same text color (foreground), 1px border, tinted background only.
   This keeps a single visual language across the entire app. */
const crowdStyle: Record<Crowd, string> = {
  low: "bg-brand-green/15 border-brand-green/40",
  moderate: "bg-brand-yellow/20 border-brand-yellow/45",
  busy: "bg-brand-coral/15 border-brand-coral/45",
};

const vendorStyle: Record<Vendor, string> = {
  open: "bg-brand-aqua/15 border-brand-aqua/45",
  pre_open: "bg-brand-yellow/18 border-brand-yellow/45",
  closed: "bg-muted border-border",
  sold_out: "bg-brand-coral/12 border-brand-coral/35",
};

const baseChip =
  "inline-flex items-center rounded-pill border px-g3 py-g1 type-caption font-semibold text-foreground";

export function CrowdChip({
  kind,
  labelKo,
  labelEn,
  className,
}: {
  kind: Crowd;
  labelKo: string;
  labelEn: string;
  className?: string;
}) {
  const { primary } = useLanguage();
  return (
    <span className={cn(baseChip, crowdStyle[kind], className)}>
      {primary(labelKo, labelEn)}
    </span>
  );
}

export function VendorStatusChip({
  kind,
  labelKo,
  labelEn,
  className,
}: {
  kind: Vendor;
  labelKo: string;
  labelEn: string;
  className?: string;
}) {
  const { primary } = useLanguage();
  return (
    <span className={cn(baseChip, vendorStyle[kind], className)}>
      {primary(labelKo, labelEn)}
    </span>
  );
}
