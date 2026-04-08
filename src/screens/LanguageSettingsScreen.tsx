import { useNavigate } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { LangSegment } from "@/components/app/TopUtilityBar";
import { useLanguage } from "@/i18n/LanguageContext";

export default function LanguageSettingsScreen() {
  const { locale, setLocale, primary, secondary } = useLanguage();
  const navigate = useNavigate();

  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader title="언어 설정 · Language" />
      <div className="flex-1 overflow-y-auto px-g4 py-g6 space-y-g6">
        <LangSegment value={locale} onChange={setLocale} />
        <div className="rounded-card border border-border p-g5 shadow-elevate-sm space-y-g3">
          <p className="type-caption text-muted-foreground">미리보기 · Preview</p>
          <p className="type-heading text-foreground">{primary("행사 안내", "Events")}</p>
          <p className="type-caption text-muted-foreground">{secondary("행사 안내", "Events")}</p>
          <p className="type-body font-medium text-brand-royal">대기 12분 · Wait 12m</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="type-body font-semibold text-brand-royal w-full py-g3"
        >
          이전 화면으로 · Back
        </button>
      </div>
    </PhoneFrame>
  );
}
