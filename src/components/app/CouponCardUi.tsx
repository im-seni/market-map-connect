import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Coupon } from "@/data/coupons";
import { formatCouponMeta } from "@/data/coupons";
import { AppBottomSheet } from "@/components/app/AppBottomSheet";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

function redeemQrPayload(coupon: Coupon) {
  return `jemulpo:redeem:${coupon.id}`;
}

export function CouponCardUi({
  coupon,
  className,
  /** false면 카드 본문을 상세 라우트로 연결하지 않음(디자인 시스템 등). */
  linkToDetail = true,
}: {
  coupon: Coupon;
  className?: string;
  linkToDetail?: boolean;
}) {
  const { locale, primary } = useLanguage();
  const isActive = coupon.state === "active";
  const meta = formatCouponMeta(coupon.expiresAt, locale, new Date(), coupon.state);
  const [qrOpen, setQrOpen] = useState(false);

  const showQr = isActive;

  return (
    <>
      <div
        className={cn(
          "rounded-card border border-border bg-card p-g4 shadow-elevate-sm transition-[box-shadow]",
          isActive && "hover:shadow-elevate-md",
          !isActive && "opacity-60",
          className,
        )}
      >
        <div className="flex items-start gap-g3">
          {linkToDetail ? (
            <Link
              to={`/coupons/${coupon.id}`}
              className="min-w-0 flex-1 space-y-g1 text-left text-inherit no-underline rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-royal/40"
            >
              <p className="type-body font-semibold text-foreground text-balance">
                {primary(coupon.titleKo, coupon.titleEn)}
              </p>
              {meta && (
                <p className="type-caption text-muted-foreground tabular-nums">{meta}</p>
              )}
            </Link>
          ) : (
            <div className="space-y-g1 min-w-0 flex-1">
              <p className="type-body font-semibold text-foreground text-balance">
                {primary(coupon.titleKo, coupon.titleEn)}
              </p>
              {meta && (
                <p className="type-caption text-muted-foreground tabular-nums">{meta}</p>
              )}
            </div>
          )}
          {showQr && (
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
        {coupon.state === "used" && (
          <p className="type-caption font-medium text-muted-foreground text-center mt-g3">
            {primary("사용 완료", "Used")}
          </p>
        )}
        {coupon.state === "expired" && (
          <p className="type-caption font-medium text-muted-foreground text-center mt-g3">
            {primary("만료", "Expired")}
          </p>
        )}
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
                redeemQrPayload(coupon),
              )}`}
              alt=""
              width={200}
              height={200}
              className="block h-[200px] w-[200px]"
            />
          </div>
          <p className="type-caption text-muted-foreground font-mono text-center break-all px-g2">
            {redeemQrPayload(coupon)}
          </p>
        </div>
      </AppBottomSheet>
    </>
  );
}
