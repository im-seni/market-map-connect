import { useNavigate } from "react-router-dom";
import logoCharacter from "@/assets/logo/character.png";
import logoWordmark from "@/assets/logo/jemulpogu.png";
import { PhoneFrame } from "@/components/app/PhoneFrame";

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <PhoneFrame className="min-h-dvh bg-[hsl(220_60%_32%)]">
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="flex flex-1 flex-col items-center justify-center gap-g8 px-g6 text-center active:opacity-95"
      >
        <div className="relative flex aspect-square w-[clamp(158px,45vw,203px)] items-center justify-center rounded-sheet bg-white/10 ring-2 ring-white/20 backdrop-blur-sm shadow-none">
          <div className="absolute inset-g3 rounded-card bg-white/90 flex items-center justify-center overflow-hidden">
            <img src={logoCharacter} alt="" className="h-full w-full object-contain p-g2 shadow-none" />
          </div>
        </div>
        <img src={logoWordmark} alt="Jemulpogu Night Market" className="h-[clamp(36px,9vw,52px)] w-auto max-w-[320px] brightness-0 invert opacity-95" />
        <p className="type-body text-white/90 max-w-[320px] font-medium tracking-tight">
          Yeonan Night Pier Market
        </p>
        <span className="type-caption text-white/70 rounded-pill border border-white/30 px-g4 py-g2">
          탭하여 시작 · Tap to start
        </span>
      </button>
    </PhoneFrame>
  );
}
