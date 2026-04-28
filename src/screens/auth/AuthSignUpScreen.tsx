import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { AppButton } from "@/components/app/AppButton";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { isValidEmailFormat } from "@/lib/emailValidation";
import { cn } from "@/lib/utils";

const inputErrorRing = "border-2 border-destructive focus-visible:ring-destructive/30";

export default function AuthSignUpScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const { signUp } = useSupabaseAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nameError = useMemo(
    () => triedSubmit && !displayName.trim(),
    [triedSubmit, displayName],
  );

  const emailInputError = useMemo(
    () => triedSubmit && (!email.trim() || !isValidEmailFormat(email) || emailTaken),
    [triedSubmit, email, emailTaken],
  );
  const passwordError = useMemo(
    () => triedSubmit && (!password || password.length < 8),
    [triedSubmit, password],
  );
  const mismatch = useMemo(
    () => password.length > 0 && confirm.length > 0 && password !== confirm,
    [password, confirm],
  );
  const confirmError = useMemo(
    () => triedSubmit && (!confirm || mismatch),
    [triedSubmit, confirm, mismatch],
  );
  const termsError = useMemo(() => triedSubmit && !agreeTerms, [triedSubmit, agreeTerms]);
  const passwordFieldsError = useMemo(
    () => passwordError || (triedSubmit && mismatch),
    [triedSubmit, passwordError, mismatch],
  );

  const emailMessage = useMemo(() => {
    if (!triedSubmit) return null;
    if (emailTaken) {
      return primary("이미 가입된 이메일이에요.", "This email is already registered.");
    }
    if (!email.trim()) {
      return primary("이메일을 입력해 주세요.", "Enter your email.");
    }
    if (!isValidEmailFormat(email)) {
      return primary(
        "올바른 이메일 형식을 입력해 주세요.",
        "Enter a valid email (e.g. name@example.com).",
      );
    }
    return null;
  }, [triedSubmit, email, emailTaken, primary]);

  const passwordMessage = useMemo(() => {
    if (!triedSubmit) return null;
    if (!password) {
      return primary("비밀번호를 입력해 주세요.", "Enter a password.");
    }
    if (password.length < 8) {
      return primary("비밀번호는 8자 이상으로 입력해 주세요.", "Use at least 8 characters.");
    }
    if (mismatch) {
      return primary("비밀번호가 일치하지 않아요.", "Passwords do not match.");
    }
    return null;
  }, [triedSubmit, password, mismatch, primary]);

  const confirmMessage = useMemo(() => {
    if (!triedSubmit) return null;
    if (!confirm) {
      return primary("비밀번호 확인을 입력해 주세요.", "Confirm your password.");
    }
    if (mismatch) {
      return primary("비밀번호가 일치하지 않아요.", "Passwords do not match.");
    }
    return null;
  }, [triedSubmit, confirm, mismatch, primary]);

  const termsMessage = useMemo(() => {
    if (!termsError) return null;
    return primary("필수 약관에 동의해 주세요.", "Please accept the required terms.");
  }, [termsError, primary]);

  const displayNameMessage = useMemo(() => {
    if (!triedSubmit || displayName.trim()) return null;
    return primary("닉네임을 입력해 주세요.", "Enter your display name.");
  }, [triedSubmit, displayName, primary]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    setEmailTaken(false);

    if (!displayName.trim()) return;
    if (!email.trim() || !isValidEmailFormat(email)) return;
    if (!password) return;
    if (password.length < 8) return;
    if (password !== confirm) return;
    if (!agreeTerms) return;

    setSubmitting(true);
    const { error, taken } = await signUp(email.trim(), password, {
      display_name: displayName.trim(),
      marketing_opt_in: marketing,
    });
    setSubmitting(false);

    if (taken || error?.toLowerCase().includes("already")) { setEmailTaken(true); return; }
    if (error) return;
    navigate("/auth/login");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <StackHeader title={primary("가입하기", "Sign up")} />
      <form
        onSubmit={submit}
        className="flex-1 overflow-y-auto px-g4 py-g5 space-y-g4"
        noValidate
      >

        <div className="space-y-g2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-g2 gap-y-1">
            <label className="type-caption font-medium text-foreground" htmlFor="auth-signup-name">
              {primary("닉네임", "Display name")}
              <span className="text-destructive"> *</span>
            </label>
            {displayNameMessage ? (
              <p className="type-caption text-destructive text-right max-w-[min(100%,220px)] leading-snug">
                {displayNameMessage}
              </p>
            ) : null}
          </div>
          <Input
            id="auth-signup-name"
            type="text"
            autoComplete="nickname"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
            }}
            className={cn("rounded-chip h-11", nameError && inputErrorRing)}
            placeholder={primary("앱에서 보여질 이름", "Name shown in the app")}
          />
        </div>
        <div className="space-y-g2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-g2 gap-y-1">
            <label className="type-caption font-medium text-foreground" htmlFor="auth-signup-email">
              {primary("이메일", "Email")}
              <span className="text-destructive"> *</span>
            </label>
            {emailMessage ? (
              <p className="type-caption text-destructive text-right max-w-[min(100%,220px)] leading-snug">
                {emailMessage}
              </p>
            ) : null}
          </div>
          <Input
            id="auth-signup-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailTaken(false);
            }}
            className={cn("rounded-chip h-11", emailInputError && inputErrorRing)}
            placeholder={primary("name@example.com", "name@example.com")}
          />
        </div>
        <div className="space-y-g2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-g2 gap-y-1">
            <label className="type-caption font-medium text-foreground" htmlFor="auth-signup-password">
              {primary("비밀번호 (8자 이상)", "Password (8+ chars)")}
              <span className="text-destructive"> *</span>
            </label>
            {passwordMessage ? (
              <p className="type-caption text-destructive text-right max-w-[min(100%,220px)] leading-snug">
                {passwordMessage}
              </p>
            ) : null}
          </div>
          <Input
            id="auth-signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn("rounded-chip h-11", passwordFieldsError && inputErrorRing)}
            minLength={8}
          />
        </div>
        <div className="space-y-g2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-g2 gap-y-1">
            <label className="type-caption font-medium text-foreground" htmlFor="auth-signup-confirm">
              {primary("비밀번호 확인", "Confirm password")}
              <span className="text-destructive"> *</span>
            </label>
            {confirmMessage ? (
              <p className="type-caption text-destructive text-right max-w-[min(100%,220px)] leading-snug">
                {confirmMessage}
              </p>
            ) : null}
          </div>
          <Input
            id="auth-signup-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={cn("rounded-chip h-11", confirmError && inputErrorRing)}
          />
        </div>

        <div className="space-y-g1">
          <div
            className={cn(
              "rounded-card border bg-card p-g3",
              "border-border",
              termsError && "border-2 border-destructive",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-x-g2 gap-y-1">
              <label className="flex min-w-0 flex-1 items-start gap-g3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-border text-brand-royal focus:ring-brand-royal"
                />
                <span className="type-caption text-foreground">
                  {primary(
                    "이용약관 및 개인정보 처리에 동의합니다. (필수)",
                    "I agree to the Terms and Privacy Policy. (required)",
                  )}
                </span>
              </label>
              {termsMessage ? (
                <p className="type-caption text-destructive shrink-0 text-right max-w-[min(100%,200px)] leading-snug">
                  {termsMessage}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <label className="flex items-start gap-g3 rounded-card border border-border bg-card p-g3">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-brand-royal focus:ring-brand-royal"
          />
          <span className="type-caption text-foreground">
            {primary(
              "야시장 소식·혜택 알림을 받아볼래요. (선택)",
              "Send me news and offers. (optional)",
            )}
          </span>
        </label>

        <AppButton
          type="submit"
          disabled={submitting}
          className={cn(
            "w-full min-h-12 bg-brand-royal text-white shadow-elevate-sm hover:brightness-105",
            "border-0",
          )}
        >
          {submitting ? primary("가입 중…", "Creating account…") : primary("가입하기", "Create account")}
        </AppButton>
        <p className="type-caption text-center text-muted-foreground">
          {primary("이미 계정이 있으신가요? ", "Already have an account? ")}
          <Link to="/auth/login" className="font-semibold text-brand-royal hover:underline">
            {primary("로그인", "Log in")}
          </Link>
        </p>
      </form>
    </div>
  );
}
