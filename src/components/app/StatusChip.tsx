import { cn } from "@/lib/utils";

type Crowd = "low" | "moderate" | "busy";
type Vendor = "open" | "sold_out" | "closing_soon";

const crowdStyle: Record<Crowd, string> = {
  low: "bg-brand-green/15 text-brand-green border-brand-green/30",
  moderate: "bg-brand-yellow/20 text-brand-navy border-brand-yellow/40",
  busy: "bg-brand-coral/15 text-brand-coral border-brand-coral/35",
};

const vendorStyle: Record<Vendor, string> = {
  open: "bg-brand-aqua/15 text-brand-blue border-brand-aqua/35",
  sold_out: "bg-muted text-muted-foreground border-border",
  closing_soon: "bg-brand-pink-light/40 text-brand-navy border-brand-pink-soft/50",
};

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
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-g3 py-g1 type-caption font-semibold",
        crowdStyle[kind],
        className
      )}
    >
      {labelKo} · {labelEn}
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
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-g3 py-g1 type-caption font-semibold",
        vendorStyle[kind],
        className
      )}
    >
      {labelKo} · {labelEn}
    </span>
  );
}
