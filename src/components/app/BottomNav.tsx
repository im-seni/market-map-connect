import { Gift, Home, Map, QrCode, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const leftItems = [
  { to: "/home", icon: Home, ko: "홈", en: "Home" },
  { to: "/map", icon: Map, ko: "지도", en: "Map" },
] as const;

const rightItems = [
  { to: "/coupons", icon: Gift, ko: "혜택", en: "Rewards" },
  { to: "/my", icon: User, ko: "마이", en: "My" },
] as const;

export function BottomNav() {
  const { locale } = useLanguage();
  const navigate = useNavigate();

  const renderItem = ({
    to,
    icon: Icon,
    ko,
    en,
  }: {
    to: string;
    icon: typeof Home;
    ko: string;
    en: string;
  }) => (
    <li key={to} className="min-w-0 flex-1">
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center gap-g1 rounded-chip py-g1 type-caption font-medium transition",
            isActive ? "text-brand-royal" : "text-muted-foreground hover:text-foreground"
          )
        }
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={2.25} />
        <span className="truncate text-[11px] leading-tight">
          {locale === "ko" ? ko : en}
        </span>
      </NavLink>
    </li>
  );

  return (
    <nav className="relative mt-auto border-t border-border bg-card/95 backdrop-blur-md px-g2 pt-g2 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_hsl(var(--brand-navy)/0.06)]">
      <ul className="flex items-end justify-between gap-g1">
        {leftItems.map(renderItem)}

        {/* Center QR scan / quick pay action */}
        <li className="min-w-0 flex-1 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/scan")}
            aria-label={locale === "ko" ? "스캔 결제" : "Scan to pay"}
            className="-mt-g6 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(to_bottom_right,hsl(223_64%_37%),hsl(195_70%_47%))] text-white shadow-[0_8px_20px_hsl(223_64%_37%/0.45)] dark:shadow-[0_4px_14px_hsl(195_70%_30%/0.5)] ring-4 ring-card transition-transform active:scale-95"
          >
            <QrCode className="h-7 w-7" strokeWidth={2.25} />
          </button>
        </li>

        {rightItems.map(renderItem)}
      </ul>
    </nav>
  );
}
