import { useNavigate } from "react-router-dom";
import logoCharacter from "../../logo/character.png";
import logoWordmark from "../../logo/jemulpogu.png";
import { PhoneFrame } from "@/components/app/PhoneFrame";

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <PhoneFrame className="min-h-dvh bg-gradient-to-b from-brand-navy via-brand-royal to-brand-navy">
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="flex flex-1 flex-col items-center justify-center gap-g8 px-g6 text-center active:opacity-95"
      >
        <div className="relative flex h-40 w-40 items-center justify-center rounded-sheet bg-white/10 shadow-elevate-lg ring-2 ring-white/20 backdrop-blur-sm">
          <div className="absolute inset-g3 rounded-card bg-white/90 shadow-elevate-md flex items-center justify-center overflow-hidden">
            <img src={logoCharacter} alt="" className="h-full w-full object-contain p-g2" />
          </div>
        </div>
        <img src={logoWordmark} alt="Jemulpogu Night Market" className="h-10 w-auto max-w-[280px] brightness-0 invert opacity-95" />
        <p className="type-body text-white/90 max-w-[280px]">
          밤바다와 야시장 · Harbor night market
        </p>
        <span className="type-caption text-white/70 rounded-pill border border-white/30 px-g4 py-g2">
          탭하여 시작 · Tap to start
        </span>
      </button>
    </PhoneFrame>
  );
}
