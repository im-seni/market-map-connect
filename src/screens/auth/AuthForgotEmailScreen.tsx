import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { AppButton } from "@/components/app/AppButton";
import { Input } from "@/components/ui/input";
import { AuthFieldError, AuthRecoveryFooterLinks, AuthSimpleMessage } from "@/components/auth/AuthRecoveryUi";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { cn } from "@/lib/utils";

const inputErrorRing = "border-destructive focus-visible:ring-destructive/30";

export default function AuthForgotEmailScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const { lookupEmailHint } = useSupabaseAuth();
  const [displayName, setDisplayName] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nameMessage = useMemo(() => {
    if (!triedSubmit) return null;
    if (!displayName.trim()) {
      return primary("닉네임을 입력해 주세요.", "Enter your nickname.");
    }
    if (displayName.trim().length < 2) {
      return primary("닉네임을 2자 이상 입력해 주세요.", "Enter at least 2 characters.");
    }
    return null;
  }, [triedSubmit, displayName, primary]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    setSubmitError(null);
    setFoundEmail(null);
    if (!displayName.trim() || displayName.trim().length < 2) return;

    setSubmitting(true);
    const { hints, error } = await lookupEmailHint(displayName.trim());
    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }
    if (hints.length > 0) {
      setFoundEmail(hints[0]);
    } else {
      setSubmitError(
        primary(
          "입력한 닉네임과 일치하는 계정을 찾지 못했어요.",
          "No account matched that display name.",
        ),
      );
    }
  };

  const resetSearch = () => {
    setFoundEmail(null);
    setTriedSubmit(false);
    setDisplayName("");
    setSubmitError(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <StackHeader title={primary("이메일 찾기", "Find email")} />
      <div className="flex-1 overflow-y-auto px-g4 py-g6">
        {foundEmail ? (
          <div className="space-y-g4 text-center max-w-sm mx-auto pt-g4">
            <h2 className="type-heading text-foreground">{primary("이메일 찾기", "Find email")}</h2>
            <AuthSimpleMessage variant="success">
              {primary("가입 이메일을 확인했어요.", "We found your registered email.")}
            </AuthSimpleMessage>
            <p className="type-body font-medium text-foreground break-all">{foundEmail}</p>
            <AuthSimpleMessage variant="muted">
              {primary(
                "위 이메일이 로그인 아이디예요. 비밀번호가 기억나지 않으면 비밀번호 찾기를 이용하세요.",
                "Use this email to log in. Use Find password if you forgot it.",
              )}
            </AuthSimpleMessage>
            <AppButton
              type="button"
              variant="secondary"
              className="w-full min-h-11 mt-g2"
              onClick={() => navigate("/auth/login")}
            >
              {primary("로그인", "Log in")}
            </AppButton>
            <button
              type="button"
              className="type-caption text-muted-foreground hover:text-foreground hover:underline"
              onClick={resetSearch}
            >
              {primary("다시 검색", "Search again")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-g4 max-w-sm mx-auto w-full" noValidate>
            <h2 className="type-heading text-center text-foreground pb-g2">
              {primary("이메일 찾기", "Find email")}
            </h2>

            <p className="text-left text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
              {primary(
                "가입할 때 설정한 닉네임을 입력하면 등록된 이메일 주소를 알려 드립니다.",
                "Enter the nickname you used at sign-up to see your registered email.",
              )}
            </p>

            <div className="space-y-g1">
              <Input
                id="auth-forgot-name"
                type="text"
                autoComplete="nickname"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setSubmitError(null);
                }}
                className={cn(
                  "rounded-chip h-12",
                  triedSubmit && (nameMessage || submitError) && inputErrorRing,
                )}
                placeholder={primary("닉네임", "Nickname")}
              />
              <AuthFieldError message={nameMessage ?? submitError} />
            </div>

            <AppButton
              type="submit"
              disabled={submitting}
              className={cn(
                "w-full min-h-12 rounded-chip text-white font-semibold border-0",
                "bg-brand-royal hover:brightness-105 shadow-elevate-sm",
              )}
            >
              {submitting ? primary("찾는 중…", "Searching…") : primary("이메일 찾기", "Find email")}
            </AppButton>
          </form>
        )}

        <AuthRecoveryFooterLinks primary={primary} hide="email" />
      </div>
    </div>
  );
}
