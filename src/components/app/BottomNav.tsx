import { CalendarDays, Clock, Gift, MapPin, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const TOUR_IDS: Record<string, string> = {
  "/map":     "tab-map",
  "/waiting": "tab-waiting",
  "/event":   "tab-event",
  "/coupons": "tab-rewards",
};

const navItems = [
  { to: "/map",     icon: MapPin,      ko: "지도·다이닝", en: "Maps"    },
  { to: "/waiting", icon: Clock,       ko: "웨이팅",     en: "Waiting" },
  { to: "/event",   icon: CalendarDays, ko: "이벤트",    en: "Events"  },
  { to: "/coupons", icon: Gift,        ko: "리워드",     en: "Rewards" },
  { to: "/my",      icon: User,        ko: "마이",       en: "My"      },
] as const;

export function BottomNav() {
  const { locale } = useLanguage();

  return (
    <nav className="mt-auto border-t border-border bg-card/95 backdrop-blur-md px-g2 pt-g2 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_hsl(var(--brand-navy)/0.06)]">
      <ul className="flex items-end justify-around gap-g1">
        {navItems.map(({ to, icon: Icon, ko, en }) => (
          <li key={to} className="min-w-0 flex-1">
            <NavLink
              to={to}
              data-tour-id={TOUR_IDS[to]}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-g1 rounded-chip py-g1 type-caption font-medium transition",
                  isActive ? "text-brand-royal" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2.25} />
              <span className="truncate text-[10px] leading-tight text-center">
                {locale === "ko" ? ko : en}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
