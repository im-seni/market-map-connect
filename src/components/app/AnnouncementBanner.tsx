import type { Announcement } from "@/data/announcements";
import { cn } from "@/lib/utils";

export function AnnouncementBanner({
  item,
  onClick,
  className,
}: {
  item: Announcement;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-card border p-g4 shadow-elevate-sm transition",
        item.urgency === "urgent"
          ? "border-brand-coral/40 bg-brand-coral/8"
          : "border-border bg-card",
        onClick && "hover:border-brand-royal/35 active:scale-[0.99]",
        className
      )}
    >
      <div className="flex flex-wrap gap-g2 mb-g2">
        <span className="rounded-pill bg-brand-navy/10 px-g3 py-g1 type-caption font-semibold text-brand-navy">
          {item.dateLabelKo} · {item.dateLabelEn}
        </span>
        <span className="rounded-pill bg-secondary px-g3 py-g1 type-caption text-foreground">
          {item.timeRangeKo} · {item.timeRangeEn}
        </span>
      </div>
      <p className="type-body font-semibold text-foreground">{item.titleKo} · {item.titleEn}</p>
      <p className="type-caption text-muted-foreground mt-g1 line-clamp-2">{item.bodyKo}</p>
    </Comp>
  );
}
