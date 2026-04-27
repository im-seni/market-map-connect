import type { Coupon } from "@/data/coupons";
import { formatCouponMeta } from "@/data/coupons";
import { AppButton } from "@/components/app/AppButton";
import { useLanguage } from "@/i18n/LanguageContext";
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
  const { locale, primary } = useLanguage();
  const isActive = coupon.state === "active";
  const meta = formatCouponMeta(coupon.expiresAt, locale);

  return (
    <div
      className={cn(
        "rounded-card border border-border bg-card p-g4 shadow-elevate-sm space-y-g3 transition-[box-shadow]",
        isActive && "hover:shadow-elevate-md",
        !isActive && "opacity-60",
        className,
      )}
    >
      <div className="space-y-g1">
        <p className="type-body font-semibold text-foreground text-balance">
          {primary(coupon.titleKo, coupon.titleEn)}
        </p>
        {meta && (
          <p className="type-caption text-muted-foreground tabular-nums">{meta}</p>
        )}
      </div>
      {isActive && onUse && (
        <AppButton variant="primary" className="w-full" onClick={onUse}>
          {primary("지금 사용", "Use now")}
        </AppButton>
      )}
      {coupon.state === "used" && (
        <p className="type-caption font-medium text-muted-foreground text-center">
          {primary("사용 완료", "Used")}
        </p>
      )}
      {coupon.state === "expired" && (
        <p className="type-caption font-medium text-muted-foreground text-center">
          {primary("만료", "Expired")}
        </p>
      )}
    </div>
  );
}
