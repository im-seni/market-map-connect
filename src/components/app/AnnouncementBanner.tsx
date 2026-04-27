import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Announcement } from "@/data/announcements";
import { useLanguage } from "@/i18n/LanguageContext";
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
  const { primary } = useLanguage();
  const navigate = useNavigate();
  const Comp = onClick ? "button" : "div";
  const hasCta = !!item.ctaHref;

  const handleCta = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.ctaHref) navigate(item.ctaHref);
  };

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-card border border-border bg-card p-g4 shadow-elevate-sm transition",
        onClick && "hover:border-brand-royal/35 active:scale-[0.99]",
        className
      )}
    >
      <div className="flex flex-wrap gap-g2 mb-g3">
        <span className="inline-flex items-center h-6 rounded-pill bg-brand-navy px-g3 type-caption font-semibold text-white">
          {primary(item.dateLabelKo, item.dateLabelEn)}
        </span>
        <span className="inline-flex items-center h-6 rounded-pill border border-border bg-secondary px-g3 type-caption text-foreground tabular-nums">
          {primary(item.timeRangeKo, item.timeRangeEn)}
        </span>
      </div>
      <p className="type-body font-semibold text-foreground text-balance">
        {primary(item.titleKo, item.titleEn)}
      </p>
      <p className="type-caption text-muted-foreground mt-g1 line-clamp-2 text-pretty">
        {primary(item.bodyKo, item.bodyEn)}
      </p>
      {hasCta && (
        <div className="mt-g3 flex">
          <span
            role="button"
            tabIndex={0}
            onClick={handleCta}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCta(e as unknown as React.MouseEvent);
              }
            }}
            className={cn(
              "inline-flex items-center gap-g1 h-9 rounded-pill px-g3 type-caption font-semibold transition-[background-color,box-shadow]",
              item.urgency === "urgent"
                ? "text-white bg-brand-navy"
                : "bg-brand-royal text-white hover:bg-brand-royal/90",
            )}
          >
            {primary("자세히 보기", "View details")}
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      )}
    </Comp>
  );
}
