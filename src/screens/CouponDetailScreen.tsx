import { useParams } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { AppButton } from "@/components/app/AppButton";
import { couponById } from "@/data/coupons";
import NotFound from "@/pages/NotFound";

export default function CouponDetailScreen() {
  const { couponId } = useParams();
  const c = couponId ? couponById(couponId) : undefined;
  if (!c) return <NotFound />;

  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader title="쿠폰 상세 · Coupon detail" />
      <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g6">
        <div className="rounded-card border border-border p-g5 shadow-elevate-md space-y-g3">
          <p className="type-title text-foreground">
            {c.titleKo} · {c.titleEn}
          </p>
          <p className="type-body text-muted-foreground">
            혜택 · Offer: {c.discountKo} · {c.discountEn}
          </p>
          <p className="type-caption text-muted-foreground">유효기간 · Valid thru {c.expiresAt}</p>
        </div>
        {c.state === "active" && (
          <AppButton variant="primary" className="w-full">
            지금 사용 · Use Now
          </AppButton>
        )}
      </div>
    </PhoneFrame>
  );
}
