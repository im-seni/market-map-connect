import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ScanLine, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { AppButton } from "@/components/app/AppButton";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import { useRewards } from "@/contexts/RewardsContext";
import { parseCheckInVendorId } from "@/lib/checkInQr";
import { cn } from "@/lib/utils";

/** Stable DOM id — Html5Qrcode requires a string id (one check-in view at a time). */
const CHECKIN_QR_REGION_ID = "scan-screen-checkin-html5";

export default function ScanScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent");
  const isCheckIn = intent === "checkin";
  const { primary } = useLanguage();
  const { addStamp } = useRewards();
  const [cameraError, setCameraError] = useState(false);
  const [manualText, setManualText] = useState("");
  const [manualError, setManualError] = useState(false);
  const html5Ref = useRef<Html5Qrcode | null>(null);

  const completeCheckIn = useCallback(
    (vendorId: string) => {
      if (!addStamp(vendorId)) return false;
      navigate("/rewards", { replace: true });
      return true;
    },
    [addStamp, navigate],
  );

  const disposeScanner = useCallback(async () => {
    const scanner = html5Ref.current;
    html5Ref.current = null;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    } catch {
      try {
        scanner.clear();
      } catch {
        /* noop */
      }
    }
  }, []);

  useEffect(() => {
    if (!isCheckIn) return;

    let cancelled = false;
    setCameraError(false);

    const scanner = new Html5Qrcode(CHECKIN_QR_REGION_ID, false);
    html5Ref.current = scanner;

    const qrboxSide = Math.min(
      220,
      typeof window !== "undefined"
        ? Math.floor(Math.min(window.innerWidth - 48, 380))
        : 220,
    );

    const config = {
      fps: 8,
      qrbox: { width: qrboxSide, height: qrboxSide },
    };

    const onDecode = (decodedText: string) => {
      if (cancelled) return;
      const id = parseCheckInVendorId(decodedText);
      if (id && addStamp(id)) {
        html5Ref.current = null;
        void scanner.stop().then(() => {
          scanner.clear();
          if (!cancelled) navigate("/rewards", { replace: true });
        });
      }
    };

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          config,
          onDecode,
          () => {},
        );
      } catch {
        if (cancelled) return;
        try {
          await scanner.start(
            { facingMode: "user" },
            config,
            onDecode,
            () => {},
          );
        } catch {
          if (!cancelled) setCameraError(true);
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      void disposeScanner();
    };
  }, [isCheckIn, addStamp, navigate, disposeScanner]);

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(false);
    const id = parseCheckInVendorId(manualText);
    if (id && completeCheckIn(id)) return;
    setManualError(true);
  };

  if (isCheckIn) {
    return (
      <div className="flex flex-1 flex-col min-h-0 bg-background text-foreground">
        <div className="flex items-center justify-between px-g4 pt-g4 pb-g2 border-b border-border">
          <span className="type-heading font-semibold">
            {primary("QR 체크인", "QR check-in")}
          </span>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-chip p-g2 hover:bg-secondary"
            aria-label={primary("닫기", "Close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 px-g4 py-g4 gap-g4 overflow-y-auto">
          <div
            className={cn(
              "relative w-full max-w-md mx-auto aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-border bg-black",
            )}
          >
            <div id={CHECKIN_QR_REGION_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
          </div>

          <p className="type-body text-center text-muted-foreground text-pretty max-w-md mx-auto">
            {primary(
              "QR을 화면 가운데에 맞춰주세요. (iPhone Safari에서도 인식됩니다)",
              "Point the camera at the QR code. Works on iPhone Safari too.",
            )}
          </p>

          {cameraError && (
            <div className="flex items-start gap-g2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-g3 py-g2 type-caption text-amber-900 dark:text-amber-100">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {primary(
                "카메라를 켤 수 없어요. 브라우저·기기 설정에서 카메라 권한을 확인하거나, 아래에 코드를 직접 입력해 보세요.",
                "Can’t access the camera. Check permissions, or enter the check-in code below.",
              )}
            </div>
          )}

          <form
            onSubmit={submitManual}
            className="max-w-md mx-auto w-full space-y-g2 rounded-lg border border-border p-g3"
          >
            <p className="type-caption text-muted-foreground">
              {primary(
                "카메라가 안 될 때: 가맹점 코드를 직접 입력 (예: jemulpo:checkin:demo)",
                "If the camera fails, type the code (e.g. jemulpo:checkin:demo)",
              )}
            </p>
            <div className="flex gap-g2">
              <Input
                value={manualText}
                onChange={(e) => {
                  setManualText(e.target.value);
                  setManualError(false);
                }}
                placeholder={primary(
                  "jemulpo:checkin:…",
                  "jemulpo:checkin:…",
                )}
                className="flex-1 font-mono text-sm"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <AppButton type="submit" variant="secondary" className="shrink-0">
                {primary("적용", "Apply")}
              </AppButton>
            </div>
            {manualError && (
              <p className="type-caption text-destructive">
                {primary(
                  "인식할 수 없는 코드입니다. 가맹점에서 안내한 문자열을 그대로 입력해 주세요.",
                  "We couldn’t read that code. Enter the exact string your venue shared.",
                )}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

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
              "Pay, earn stamps, or redeem coupons in one tap.",
            )}
          </p>
        </div>
      </div>

      <div className="px-g4 pb-g6 pt-g4">
        <AppButton
          variant="primary"
          className="w-full"
          onClick={() => navigate("/rewards")}
        >
          {primary("내 쿠폰 보기", "View my coupons")}
        </AppButton>
      </div>
    </div>
  );
}
