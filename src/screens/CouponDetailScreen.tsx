import { useParams } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { AppButton } from "@/components/app/AppButton";
import { formatCouponMeta } from "@/data/coupons";
import { useCoupons } from "@/contexts/CouponsContext";
import { useLanguage } from "@/i18n/LanguageContext";
import NotFound from "@/pages/NotFound";

export default function CouponDetailScreen() {
  const { couponId } = useParams();
  const { locale, primary } = useLanguage();
  const { couponById } = useCoupons();
  const c = couponId ? couponById(couponId) : undefined;
  if (!c) return <NotFound />;

  const meta = formatCouponMeta(c.expiresAt, locale);

  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader title={primary("쿠폰 상세", "Coupon details")} />
      <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g6">
        <div className="rounded-card border border-border p-g5 shadow-elevate-md space-y-g3">
          <p className="type-title text-foreground">{primary(c.titleKo, c.titleEn)}</p>
          {meta && <p className="type-caption text-muted-foreground">{meta}</p>}
        </div>
        {c.state === "active" && (
          <AppButton variant="primary" className="w-full">
            {primary("지금 사용", "Use now")}
          </AppButton>
        )}
      </div>
    </PhoneFrame>
  );
}

