import { Gift, Home, Map, Ticket, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", icon: Home, ko: "홈", en: "Home" },
  { to: "/map", icon: Map, ko: "지도", en: "Map" },
  { to: "/rewards", icon: Gift, ko: "리워드", en: "Rewards" },
  { to: "/coupons", icon: Ticket, ko: "쿠폰", en: "Coupons" },
  { to: "/my", icon: User, ko: "마이", en: "My" },
] as const;

export function BottomNav() {
  const { locale } = useLanguage();

  return (
    <nav className="mt-auto border-t border-border bg-card/95 backdrop-blur-md px-g2 pt-g2 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_hsl(var(--brand-navy)/0.06)]">
      <ul className="flex justify-between gap-g1">
        {items.map(({ to, icon: Icon, ko, en }) => (
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
              <span className="truncate text-[11px] leading-tight">{locale === "ko" ? ko : en}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
