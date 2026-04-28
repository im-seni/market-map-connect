import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { AppBottomSheet } from "@/components/app/AppBottomSheet";
import { AppButton } from "@/components/app/AppButton";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { Skeleton } from "@/components/ui/skeleton";
import type { Coupon } from "@/data/coupons";
import { formatCouponMeta } from "@/data/coupons";
import { couponFromSupabaseRow, useCoupons } from "@/contexts/CouponsContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/i18n/LanguageContext";
import NotFound from "@/pages/NotFound";

function redeemPayload(couponId: string) {
  return `jemulpo:redeem:${couponId}`;
}

export default function CouponDetailScreen() {
  const { couponId } = useParams();
  const navigate = useNavigate();
  const { locale, primary } = useLanguage();
  const { user } = useSupabaseAuth();
  const { couponById } = useCoupons();
  const fromList = couponId ? couponById(couponId) : undefined;
  const [fetched, setFetched] = useState<Coupon | null>(null);
  const [fetchDone, setFetchDone] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    if (!couponId) {
      setFetched(null);
      setFetchDone(true);
      return;
    }
    if (!user) {
      setFetched(null);
      setFetchDone(true);
      return;
    }
    if (fromList) {
      setFetched(null);
      setFetchDone(true);
      return;
    }
    let cancelled = false;
    setFetchDone(false);
    setFetched(null);
    void supabase
      .from("coupons")
      .select("id, title_ko, title_en, vendor_id, expires_at, state")
      .eq("id", couponId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setFetched(null);
        } else {
          setFetched(couponFromSupabaseRow(data));
        }
        setFetchDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, [couponId, user?.id, fromList]);

  const c = fromList ?? fetched;
  if (!couponId) return <NotFound />;
  if (!user) {
    return (
      <PhoneFrame className="min-h-dvh">
        <StackHeader title={primary("쿠폰 상세", "Coupon details")} />
        <div className="flex-1 px-g4 py-g6 space-y-g4">
          <p className="type-body text-muted-foreground">
            {primary("로그인 후 쿠폰을 확인할 수 있어요", "Sign in to view this coupon")}
          </p>
          <AppButton variant="primary" className="w-full" onClick={() => navigate("/auth/login")}>
            {primary("로그인", "Sign in")}
          </AppButton>
        </div>
      </PhoneFrame>
    );
  }
  if (!fromList && !fetchDone) {
    return (
      <PhoneFrame className="min-h-dvh">
        <StackHeader title={primary("쿠폰 상세", "Coupon details")} />
        <div className="flex-1 px-g4 py-g6 space-y-g3">
          <Skeleton className="h-8 w-[min(90%,320px)]" />
          <Skeleton className="h-4 w-[min(60%,200px)]" />
        </div>
      </PhoneFrame>
    );
  }
  if (!c) return <NotFound />;

  const meta = formatCouponMeta(c.expiresAt, locale, new Date(), c.state);
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

