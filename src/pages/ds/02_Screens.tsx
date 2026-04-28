import { Link } from "react-router-dom";
import { PhoneFrame } from "@/components/app/PhoneFrame";

const links: { to: string; label: string }[] = [
  { to: "/", label: "Splash / Entry" },
  { to: "/login", label: "Login / Guest" },
  { to: "/home", label: "Home / Discovery" },
  { to: "/map", label: "Map + sheet" },
  { to: "/vendor/1", label: "Vendor Detail" },
  { to: "/vendor/1/menu", label: "Menu" },
  { to: "/rewards", label: "Rewards / Stamp" },
  { to: "/coupons", label: "Coupons (detail: UUID in /coupons/:id)" },
  { to: "/my/payment", label: "Payment Methods" },
  { to: "/announcements", label: "Announcements" },
  { to: "/my", label: "My Page" },
  { to: "/my/language", label: "Language Settings" },
];

export default function ScreensHubPage() {
  return (
    <PhoneFrame className="min-h-dvh bg-background">
      <header className="border-b border-border px-g4 py-g4 flex items-center justify-between">
        <h1 className="type-title">02_Screens</h1>
        <Link to="/ds/03-prototype" className="type-caption text-brand-royal font-semibold">
          Prototype →
        </Link>
      </header>
      <div className="flex-1 overflow-y-auto px-g4 py-g4 space-y-g2">
        <p className="type-caption text-muted-foreground pb-g4">12 required screens · 390×844 frame</p>
        <ul className="space-y-g2 pb-g8">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="block rounded-card border border-border bg-card px-g4 py-g4 type-body font-medium shadow-elevate-sm hover:border-brand-royal/40"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PhoneFrame>
  );
}
