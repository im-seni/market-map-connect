import { useNavigate } from "react-router-dom";
import { AppButton } from "@/components/app/AppButton";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { QrCode } from "lucide-react";

export default function LoginScreen() {
  const navigate = useNavigate();
  const goHome = () => navigate("/home");

  return (
    <PhoneFrame className="min-h-dvh justify-between bg-background">
      <div className="px-g6 pt-g8 space-y-g6">
        <div>
          <h1 className="type-display text-foreground">안녕하세요 · Hello</h1>
          <p className="type-body text-muted-foreground mt-g2">
            제물포구 야시장에 오신 것을 환영합니다 · Welcome to Jemulpogu Night Market
          </p>
        </div>
        <div className="space-y-g3">
          <AppButton variant="primary" className="w-full" onClick={goHome}>
            게스트로 계속 · Continue as Guest
          </AppButton>
          <AppButton variant="secondary" className="w-full" onClick={goHome}>
            로그인 · Log In
          </AppButton>
          <AppButton variant="tertiary" className="w-full min-h-[40px]" onClick={goHome}>
            <QrCode className="h-5 w-5" />
            QR 스캔 · Scan QR
          </AppButton>
        </div>
      </div>
      <div className="px-g6 pb-g8 space-y-g3">
        <p className="type-caption text-center text-muted-foreground">소셜 로그인 · Social</p>
        <div className="flex justify-center gap-g3">
          {["Google", "Apple", "Kakao"].map((name) => (
            <button
              key={name}
              type="button"
              onClick={goHome}
              className="rounded-chip border border-border bg-card px-g4 py-g3 type-caption font-medium shadow-elevate-sm"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
