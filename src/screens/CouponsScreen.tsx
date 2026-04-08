import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { CouponCardUi } from "@/components/app/CouponCardUi";
import { coupons, type CouponState } from "@/data/coupons";
import { cn } from "@/lib/utils";

const tabs: { id: CouponState; ko: string; en: string }[] = [
  { id: "active", ko: "사용 가능", en: "Active" },
  { id: "used", ko: "사용함", en: "Used" },
  { id: "expired", ko: "만료", en: "Expired" },
];

export default function CouponsScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<CouponState>("active");

  const list = useMemo(() => coupons.filter((c) => c.state === tab), [tab]);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />
      <div className="px-g4 pt-g4 flex gap-g2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-g3 type-caption font-semibold border-b-2 transition",
              tab === t.id ? "border-brand-royal text-brand-royal" : "border-transparent text-muted-foreground"
            )}
          >
            {t.ko} · {t.en}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-g4 py-g4 space-y-g4">
        {list.length === 0 ? (
          <p className="type-body text-center text-muted-foreground py-g8">쿠폰이 없습니다 · No coupons</p>
        ) : (
          list.map((c) => (
            <CouponCardUi
              key={c.id}
              coupon={c}
              onUse={c.state === "active" ? () => navigate(`/coupons/${c.id}`) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
