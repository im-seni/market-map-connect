import { Link } from "react-router-dom";
import { PhoneFrame } from "@/components/app/PhoneFrame";

const flow = [
  "Splash → Login",
  "Guest / Login → Home",
  'Home quick chip "View Map" → Map',
  "Map pin → Bottom Sheet → Vendor Detail",
  "Vendor Detail → Menu",
  "Vendor Detail → Collect Stamp → Rewards",
  "Home featured coupon → Coupons → Coupon Detail → Use Now",
  "Home notice → Announcements",
  "My → Language Settings → back (labels update)",
];

export default function PrototypePage() {
  return (
    <PhoneFrame className="min-h-dvh bg-background">
      <header className="border-b border-border px-g4 py-g4">
        <h1 className="type-title">03_Prototype</h1>
        <p className="type-caption text-muted-foreground mt-g2">Clickable flow · 시작은 스플래시</p>
      </header>
      <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g6">
        <Link
          to="/"
          className="block w-full rounded-card bg-brand-coral text-white text-center py-g4 type-heading shadow-elevate-md"
        >
          프로토타입 시작 · Launch
        </Link>
        <section>
          <h2 className="type-heading mb-g4">Happy path</h2>
          <ol className="list-decimal list-inside space-y-g2 type-body text-muted-foreground">
            {flow.map((step) => (
              <li key={step} className="pl-g1">
                {step}
              </li>
            ))}
          </ol>
        </section>
        <div className="flex flex-col gap-g3 pb-g8">
          <Link to="/ds/00-foundation" className="type-caption font-semibold text-brand-royal">
            ← 00_Foundation
          </Link>
          <Link to="/ds/01-components" className="type-caption font-semibold text-brand-royal">
            ← 01_Components
          </Link>
          <Link to="/ds/02-screens" className="type-caption font-semibold text-brand-royal">
            ← 02_Screens
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
