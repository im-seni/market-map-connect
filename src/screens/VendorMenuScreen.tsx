import { useParams } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { storeById } from "@/data/stores";
import NotFound from "@/pages/NotFound";
import { cn } from "@/lib/utils";

export default function VendorMenuScreen() {
  const { id } = useParams();
  const store = id ? storeById(id) : undefined;
  if (!store) return <NotFound />;

  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader title={`메뉴 · Menu · ${store.name}`} />
      <div className="flex-1 overflow-y-auto px-g4 py-g4 space-y-g3 pb-g8">
        {store.menu.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-g3 rounded-card border border-border p-g4 shadow-elevate-sm",
              item.soldOut && "opacity-50"
            )}
          >
            <div className="h-16 w-16 shrink-0 rounded-chip bg-brand-pink-light/40 flex items-center justify-center text-2xl">
              {store.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-g2 items-center">
                <p className="type-body font-semibold">{item.name}</p>
                {item.popular && (
                  <span className="rounded-pill bg-brand-yellow/30 px-g2 py-g1 type-caption font-semibold text-brand-navy">
                    인기 · Popular
                  </span>
                )}
                {item.spicy && (
                  <span className="rounded-pill bg-brand-coral/15 px-g2 py-g1 type-caption font-semibold text-brand-coral">
                    매운맛 · Spicy
                  </span>
                )}
                {item.signature && (
                  <span className="rounded-pill bg-brand-royal/15 px-g2 py-g1 type-caption font-semibold text-brand-royal">
                    시그니처 · Signature
                  </span>
                )}
                {item.soldOut && (
                  <span className="rounded-pill bg-muted px-g2 py-g1 type-caption text-muted-foreground">
                    품절 · Sold out
                  </span>
                )}
              </div>
              <p className="type-caption text-muted-foreground mt-g1">{item.description}</p>
              <p className="type-body font-bold text-brand-royal mt-g2">{item.price.toLocaleString()}₩</p>
            </div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}
