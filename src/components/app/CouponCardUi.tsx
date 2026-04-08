import type { Coupon } from "@/data/coupons";
import { AppButton } from "@/components/app/AppButton";
import { cn } from "@/lib/utils";

export function CouponCardUi({
  coupon,
  onUse,
  className,
}: {
  coupon: Coupon;
  onUse?: () => void;
  className?: string;
}) {
  const isActive = coupon.state === "active";

  return (
    <div
      className={cn(
        "rounded-card border border-border bg-card p-g4 shadow-elevate-sm space-y-g3",
        !isActive && "opacity-60",
        className
      )}
    >
      <div>
        <p className="type-body font-semibold text-foreground">
          {coupon.titleKo} · {coupon.titleEn}
        </p>
        <p className="type-caption text-muted-foreground mt-g1">
          {coupon.discountKo} · {coupon.discountEn} · ~ {coupon.expiresAt}
        </p>
      </div>
      {isActive && onUse && (
        <AppButton variant="primary" className="w-full" onClick={onUse}>
          지금 사용 · Use Now
        </AppButton>
      )}
      {coupon.state === "used" && (
        <p className="type-caption font-medium text-muted-foreground text-center">사용 완료 · Used</p>
      )}
      {coupon.state === "expired" && (
        <p className="type-caption font-medium text-muted-foreground text-center">만료 · Expired</p>
      )}
    </div>
  );
}
