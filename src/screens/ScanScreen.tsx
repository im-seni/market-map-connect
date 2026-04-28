import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ScanLine, X } from "lucide-react";
import { AppButton } from "@/components/app/AppButton";
import { useLanguage } from "@/i18n/LanguageContext";
import { useRewards } from "@/contexts/RewardsContext";
import { parseCheckInVendorId } from "@/lib/checkInQr";
import { cn } from "@/lib/utils";

export default function ScanScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent");
  const isCheckIn = intent === "checkin";
  const { primary } = useLanguage();
  const { addStamp } = useRewards();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    if (!isCheckIn) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    setCameraError(false);

    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch {
        setCameraError(true);
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        void v.play();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const BarcodeDetector = (window as any).BarcodeDetector as
        | (new (o: { formats: string[] }) => { detect: (c: HTMLCanvasElement) => Promise<{ rawValue?: string }[]> })
        | undefined;
      if (!BarcodeDetector) {
        return;
      }
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const tick = async () => {
        if (cancelled) return;
        const vid = videoRef.current;
        if (!vid || vid.readyState < 2) {
          raf = requestAnimationFrame(() => void tick());
          return;
        }
        const w = vid.videoWidth;
        const h = vid.videoHeight;
        if (w < 2 || h < 2) {
          raf = requestAnimationFrame(() => void tick());
          return;
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(vid, 0, 0, w, h);
        try {
          const codes = await detector.detect(canvas);
          if (codes.length > 0) {
            const raw = codes[0]?.rawValue ?? "";
            const id = parseCheckInVendorId(raw);
            if (id && addStamp(id)) {
              stream?.getTracks().forEach((t) => t.stop());
              navigate("/rewards", { replace: true });
              return;
            }
          }
        } catch {
          /* single frame */
        }
        raf = requestAnimationFrame(() => void tick());
      };
      raf = requestAnimationFrame(() => void tick());
    };

    void run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isCheckIn, addStamp, navigate]);

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

        <div className="flex-1 flex flex-col min-h-0 px-g4 py-g4 gap-g4">
          <div
            className={cn(
              "relative w-full max-w-md mx-auto aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-border bg-black/80",
            )}
          >
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              autoPlay
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-lg border-2 border-white/70" />
            </div>
          </div>

          <p className="type-body text-center text-muted-foreground text-pretty max-w-md mx-auto">
            {primary(
              "QR을 테두리 안에 맞춰주세요",
              "Align the QR inside the frame.",
            )}
          </p>

          {cameraError && (
            <div className="flex items-start gap-g2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-g3 py-g2 type-caption text-amber-900 dark:text-amber-100">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {primary(
                "카메라를 켤 수 없어요. 브라우저·기기 설정에서 카메라 권한을 확인해 주세요.",
                "Can’t access the camera. Allow camera permission in browser or device settings.",
              )}
            </div>
          )}
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
