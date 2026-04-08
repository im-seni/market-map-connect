import { Link } from "react-router-dom";
import { PhoneFrame } from "@/components/app/PhoneFrame";

const colors = [
  { name: "brand/royal", token: "bg-brand-royal", hex: "#22439A" },
  { name: "brand/navy", token: "bg-brand-navy", hex: "#11376F" },
  { name: "text/primary", token: "bg-[#384C56]", hex: "#384C56" },
  { name: "accent/coral", token: "bg-brand-coral", hex: "#F47556" },
  { name: "accent/green", token: "bg-brand-green", hex: "#72C458" },
  { name: "accent/blue", token: "bg-brand-blue", hex: "#1664A4" },
  { name: "accent/aqua", token: "bg-brand-aqua", hex: "#24A0CA" },
  { name: "accent/pink-soft", token: "bg-brand-pink-soft", hex: "#DB97AA" },
  { name: "accent/pink-light", token: "bg-brand-pink-light", hex: "#F0B5C9" },
  { name: "accent/yellow", token: "bg-brand-yellow", hex: "#F2B423" },
  { name: "neutral/offwhite", token: "bg-brand-offwhite border border-border", hex: "#FDFCFC" },
  { name: "neutral/lightgray", token: "bg-brand-lightgray", hex: "#DADFE1" },
  { name: "neutral/muted", token: "bg-brand-muted", hex: "#A4A0A4" },
] as const;

export default function FoundationPage() {
  return (
    <PhoneFrame className="min-h-dvh bg-background">
      <header className="border-b border-border px-g4 py-g4 flex items-center justify-between">
        <h1 className="type-title">00_Foundation</h1>
        <Link to="/ds/03-prototype" className="type-caption text-brand-royal font-semibold">
          Prototype →
        </Link>
      </header>
      <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g8">
        <section>
          <h2 className="type-heading mb-g4">Frame · iPhone 14</h2>
          <p className="type-body text-muted-foreground">390 × 844 · max-width token · --frame-width / --frame-min-height</p>
        </section>
        <section>
          <h2 className="type-heading mb-g4">8pt spacing · g1–g8</h2>
          <div className="flex flex-wrap items-end gap-g4">
            {[
              ["g1", "4px"],
              ["g2", "8px"],
              ["g3", "12px"],
              ["g4", "16px"],
              ["g5", "20px"],
              ["g6", "24px"],
              ["g8", "32px"],
            ].map(([k, px]) => (
              <div key={k} className="text-center">
                <div className="mx-auto bg-brand-royal rounded-chip" style={{ width: px, height: 32 }} />
                <p className="type-caption mt-g2">
                  {k} · {px}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="type-heading mb-g4">Corner radii</h2>
          <div className="grid grid-cols-2 gap-g4">
            <div className="h-16 bg-secondary rounded-chip border border-border flex items-center justify-center type-caption">12 chip</div>
            <div className="h-16 bg-secondary rounded-card border border-border flex items-center justify-center type-caption">16 card</div>
            <div className="h-16 bg-secondary rounded-sheet border border-border flex items-center justify-center type-caption">24 sheet</div>
            <div className="h-16 bg-secondary rounded-pill border border-border flex items-center justify-center type-caption">999 pill</div>
          </div>
        </section>
        <section>
          <h2 className="type-heading mb-g4">Shadows · navy tint</h2>
          <div className="grid gap-g4">
            <div className="h-14 bg-card rounded-card shadow-elevate-sm flex items-center px-g4 type-caption">elevate-sm</div>
            <div className="h-14 bg-card rounded-card shadow-elevate flex items-center px-g4 type-caption">elevate (md)</div>
            <div className="h-14 bg-card rounded-card shadow-elevate-lg flex items-center px-g4 type-caption">elevate-lg</div>
          </div>
        </section>
        <section>
          <h2 className="type-heading mb-g4">Typography</h2>
          <div className="space-y-g3">
            <p className="type-display">Display 28/34 Bold</p>
            <p className="type-title">Title 22/28 Semibold</p>
            <p className="type-heading">Heading 18/24 Semibold</p>
            <p className="type-body">Body 15/22 Regular — 한글과 English pairing</p>
            <p className="type-caption">Caption 13/18 Medium</p>
          </div>
        </section>
        <section>
          <h2 className="type-heading mb-g4">Color tokens</h2>
          <div className="grid grid-cols-2 gap-g3">
            {colors.map((c) => (
              <div key={c.name} className="rounded-card border border-border overflow-hidden shadow-elevate-sm">
                <div className={`h-14 ${c.token}`} />
                <p className="type-caption p-g2">{c.name}</p>
                <p className="type-caption px-g2 pb-g2 text-muted-foreground">{c.hex}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PhoneFrame>
  );
}
