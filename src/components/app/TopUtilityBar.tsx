import type { ReactNode } from "react";
import { Bell, Languages, QrCode, Search } from "lucide-react";
import { useLanguage, type Locale } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export function TopUtilityBar({
  showSearchSlot,
  searchSlot,
  className,
}: {
  showSearchSlot?: boolean;
  searchSlot?: ReactNode;
  className?: string;
}) {
  const { locale, setLocale } = useLanguage();

  const toggleLang = () => setLocale(locale === "ko" ? "en" : "ko");

  return (
    <div className={cn("px-g4 pt-g3 pb-g2 space-y-g2 bg-card/90 backdrop-blur-md border-b border-border shadow-elevate-sm", className)}>
      <div className="flex items-center justify-between gap-g2">
        <button
          type="button"
          onClick={toggleLang}
          className="flex items-center gap-g1 rounded-chip border border-border bg-secondary px-g3 py-g2 type-caption font-semibold text-foreground"
          aria-label="Toggle language"
        >
          <Languages className="h-4 w-4 text-brand-royal" />
          <span>{locale === "ko" ? "KOR" : "ENG"}</span>
        </button>
        <div className="flex items-center gap-g1">
          <button
            type="button"
            className="rounded-chip p-g2 text-foreground hover:bg-secondary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-chip p-g2 text-foreground hover:bg-secondary" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-chip p-g2 text-foreground hover:bg-secondary" aria-label="QR">
            <QrCode className="h-5 w-5" />
          </button>
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
  value: Locale;
  onChange: (l: Locale) => void;
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
            value === l ? "bg-card text-brand-royal shadow-elevate-sm" : "text-muted-foreground"
          )}
        >
          {l === "ko" ? "한국어" : "English"}
        </button>
      ))}
    </div>
  );
}
