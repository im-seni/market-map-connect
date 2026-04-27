import type { ReactNode } from "react";
import { Bell, Globe, Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export function TopUtilityBar({
  showLogo = true,
  showSearchSlot,
  searchSlot,
  className,
}: {
  showLogo?: boolean;
  showSearchSlot?: boolean;
  searchSlot?: ReactNode;
  className?: string;
}) {
  const { locale, setLocale } = useLanguage();

  const toggleLang = () => setLocale(locale === "ko" ? "en" : "ko");

  return (
    <div
      className={cn(
        "px-g4 pt-g3 pb-g3 space-y-g3 bg-card/90 backdrop-blur-md border-b border-border shadow-elevate-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-g2 min-h-9">
        {showLogo ? (
          <div className="flex items-center">
            <img
              src="/logo/jemulpogu.png"
              alt="Jemulpo Night Market"
              className="h-8 w-auto block dark:hidden"
            />
            <img
              src="/logo/jemulpogu-dark.png"
              alt="Jemulpo Night Market"
              className="h-8 w-auto hidden dark:block"
            />
          </div>
        ) : (
          <span aria-hidden className="h-8" />
        )}
        <div className="flex items-center gap-g1">
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-g1 h-9 rounded-pill bg-secondary px-g3 type-caption font-semibold text-foreground transition hover:bg-secondary/70"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4 text-brand-royal" />
            <span className="tabular-nums">{locale === "ko" ? "KOR" : "ENG"}</span>
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-chip text-foreground hover:bg-secondary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          {!showSearchSlot && (
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-chip text-foreground hover:bg-secondary"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      {showSearchSlot && searchSlot}
    </div>
  );
}

export function LangSegment({
  value,
  onChange,
}: {
  value: "ko" | "en";
  onChange: (l: "ko" | "en") => void;
}) {
  return (
    <div className="flex rounded-chip border border-border p-g1 bg-secondary">
      {(["ko", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={cn(
            "flex-1 rounded-chip py-g2 type-caption font-semibold transition",
            value === l ? "bg-card text-brand-royal shadow-elevate-sm" : "text-muted-foreground",
          )}
        >
          {l === "ko" ? "한국어" : "English"}
        </button>
      ))}
    </div>
  );
}
