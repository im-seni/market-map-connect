import { useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { AppBottomSheet } from "@/components/app/AppBottomSheet";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { formatCouponMeta } from "@/data/coupons";
import { useCoupons } from "@/contexts/CouponsContext";
import { useLanguage } from "@/i18n/LanguageContext";
import NotFound from "@/pages/NotFound";

function redeemPayload(couponId: string) {
  return `jemulpo:redeem:${couponId}`;
}

export default function CouponDetailScreen() {
  const { couponId } = useParams();
  const { locale, primary } = useLanguage();
  const { couponById } = useCoupons();
  const c = couponId ? couponById(couponId) : undefined;
  const [qrOpen, setQrOpen] = useState(false);
  if (!c) return <NotFound />;

  const meta = formatCouponMeta(c.expiresAt, locale);
  const isActive = c.state === "active";
  const payload = redeemPayload(c.id);

  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader title={primary("쿠폰 상세", "Coupon details")} />
      <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g6">
        <div className="rounded-card border border-border p-g5 shadow-elevate-md">
          <div className="flex items-start gap-g3">
            <div className="space-y-g3 min-w-0 flex-1">
              <p className="type-title text-foreground">{primary(c.titleKo, c.titleEn)}</p>
              {meta && <p className="type-caption text-muted-foreground">{meta}</p>}
            </div>
            {isActive && (
              <button
                type="button"
                onClick={() => setQrOpen(true)}
                className="shrink-0 mt-0.5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-royal bg-brand-royal/10 text-brand-royal shadow-elevate-sm transition hover:bg-brand-royal/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-royal/40"
                aria-label={primary("사용 QR 보기", "Show redemption QR")}
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      <AppBottomSheet
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title={primary("사용 QR", "Redemption QR")}
      >
        <div className="flex flex-col items-center gap-g3 pt-g2 pb-g1">
          <p className="type-caption text-center text-muted-foreground text-pretty px-g2">
            {primary(
              "매장에 제시할 QR이에요. 밝기를 올려 주세요.",
              "Show this QR at the counter. Turn up screen brightness.",
            )}
          </p>
          <div className="rounded-xl border border-border bg-white p-g3 shadow-elevate-sm">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                payload,
              )}`}
              alt=""
              width={200}
              height={200}
              className="block h-[200px] w-[200px]"
            />
          </div>
          <p className="type-caption text-muted-foreground font-mono text-center break-all px-g2">
            {payload}
          </p>
        </div>
      </AppBottomSheet>
    </PhoneFrame>
  );
}

