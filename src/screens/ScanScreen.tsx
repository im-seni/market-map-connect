import { useNavigate } from "react-router-dom";
import { ScanLine, X } from "lucide-react";
import { AppButton } from "@/components/app/AppButton";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ScanScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-foreground text-background">
      <div className="flex items-center justify-between px-g4 pt-g4 pb-g2">
        <span className="type-heading font-semibold">
          {primary("스캔 결제", "Scan to pay")}
        </span>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-chip p-g2 hover:bg-background/10"
          aria-label={primary("닫기", "Close")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-g6 px-g6">
        <div className="relative h-64 w-64 rounded-card border-2 border-dashed border-background/40 flex items-center justify-center">
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-brand-coral animate-pulse" />
          <ScanLine className="h-16 w-16 text-background/60" strokeWidth={1.5} />
        </div>
        <div className="text-center space-y-g2">
          <p className="type-title">
            {primary("QR 코드를 스캔하세요", "Scan a QR code")}
          </p>
          <p className="type-body text-background/70 text-pretty">
            {primary(
              "결제, 스탬프 적립, 쿠폰 사용을 빠르게 처리하세요.",
              "Pay, earn stamps, or redeem coupons in one tap."
            )}
          </p>
        </div>
      </div>

      <div className="px-g4 pb-g6 pt-g4">
        <AppButton
          variant="primary"
          className="w-full"
          onClick={() => navigate("/coupons")}
        >
          {primary("내 쿠폰 보기", "View my coupons")}
        </AppButton>
      </div>
    </div>
  );
}
