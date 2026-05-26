import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { AppButton } from "@/components/app/AppButton";
import { Input } from "@/components/ui/input";
import { AuthFieldError, AuthRecoveryFooterLinks, AuthSimpleMessage } from "@/components/auth/AuthRecoveryUi";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { isValidEmailFormat } from "@/lib/emailValidation";
import { cn } from "@/lib/utils";

const inputErrorRing = "border-destructive focus-visible:ring-destructive/30";

export default function AuthForgotPasswordScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const { resetPassword } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailMessage = useMemo(() => {
    if (!triedSubmit) return null;
    if (!email.trim()) {
      return primary("이메일을 입력해 주세요.", "Enter your email.");
    }
    if (!isValidEmailFormat(email)) {
      return primary("올바른 이메일 형식을 입력해 주세요.", "Enter a valid email.");
    }
    return null;
  }, [triedSubmit, email, primary]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    setSubmitError(null);
    if (!email.trim() || !isValidEmailFormat(email)) return;

    setSubmitting(true);
    const { error } = await resetPassword(email.trim());
    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <StackHeader title={primary("비밀번호 찾기", "Forgot password")} />
      <div className="flex-1 overflow-y-auto px-g4 py-g6">
        {sent ? (
          <div className="space-y-g4 text-center max-w-sm mx-auto pt-g4">
            <h2 className="type-heading text-foreground">{primary("비밀번호 찾기", "Forgot password")}</h2>
            <AuthSimpleMessage variant="success">
              {primary("재설정 링크를 보냈어요.", "We sent a reset link.")}
            </AuthSimpleMessage>
            <p className="type-body font-medium text-foreground break-all">{email.trim()}</p>
            <AuthSimpleMessage variant="muted">
              {primary(
                "메일함과 스팸함을 확인한 뒤 링크를 눌러 새 비밀번호를 설정하세요.",
                "Check your inbox and spam, then open the link to set a new password.",
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
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-g4 max-w-sm mx-auto w-full" noValidate>
            <h2 className="type-heading text-center text-foreground pb-g2">
              {primary("비밀번호 찾기", "Forgot password")}
            </h2>

            <div className="space-y-g1">
              <Input
                id="auth-forgot-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubmitError(null);
                }}
                className={cn(
                  "rounded-chip h-12",
                  triedSubmit && (emailMessage || submitError) && inputErrorRing,
                )}
                placeholder={primary("이메일", "Email")}
              />
              <AuthFieldError message={emailMessage ?? submitError} />
            </div>

            <AppButton
              type="submit"
              disabled={submitting}
              className={cn(
                "w-full min-h-12 rounded-chip text-white font-semibold border-0",
                "bg-brand-royal hover:brightness-105 shadow-elevate-sm",
              )}
            >
              {submitting ? primary("보내는 중…", "Sending…") : primary("비밀번호 찾기", "Find password")}
            </AppButton>
          </form>
        )}

        <AuthRecoveryFooterLinks primary={primary} hide="password" />
      </div>
    </div>
  );
}
