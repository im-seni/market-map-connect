import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { AppButton } from "@/components/app/AppButton";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import { loginWithEmailPassword, setDemoSession } from "@/lib/demoAuthStorage";
import { isValidEmailFormat } from "@/lib/emailValidation";
import { cn } from "@/lib/utils";

const inputErrorRing = "border-2 border-destructive focus-visible:ring-destructive/30";

export default function AuthLoginScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [credentialsWrong, setCredentialsWrong] = useState(false);

  const emailError = useMemo(
    () => triedSubmit && (!email.trim() || !isValidEmailFormat(email)),
    [triedSubmit, email],
  );
  const passwordError = useMemo(() => triedSubmit && !password, [triedSubmit, password]);

  const emailMessage = useMemo(() => {
    if (!triedSubmit) return null;
    if (!email.trim()) {
      return primary("이메일을 입력해 주세요.", "Enter your email.");
    }
    if (!isValidEmailFormat(email)) {
      return primary(
        "올바른 이메일 형식을 입력해 주세요. (예: name@example.com)",
        "Enter a valid email (e.g. name@example.com).",
      );
    }
    return null;
  }, [triedSubmit, email, primary]);

  const passwordMessage = useMemo(() => {
    if (!triedSubmit || password) return null;
    return primary("비밀번호를 입력해 주세요.", "Enter your password.");
  }, [triedSubmit, password, primary]);

  const credentialsMessage = useMemo(() => {
    if (!credentialsWrong) return null;
    return primary(
      "이메일 또는 비밀번호가 올바르지 않아요.",
      "Incorrect email or password.",
    );
  }, [credentialsWrong, primary]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    setCredentialsWrong(false);
    if (!email.trim() || !isValidEmailFormat(email) || !password) return;

    const user = loginWithEmailPassword(email, password);
    if (!user) {
      setCredentialsWrong(true);
      return;
    }
    setDemoSession({ email: user.email, displayName: user.displayName });
    navigate("/map");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <StackHeader title={primary("로그인", "Log in")} />
      <form
        onSubmit={submit}
        className="flex-1 overflow-y-auto px-g4 py-g5 space-y-g5"
        noValidate
      >
        <div className="space-y-g2">

          {credentialsMessage ? (
            <p className="type-caption text-destructive">{credentialsMessage}</p>
          ) : null}
        </div>
        <div className="space-y-g2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-g2 gap-y-1">
            <label className="type-caption font-medium text-foreground" htmlFor="auth-login-email">
              {primary("이메일", "Email")}
            </label>
            {emailMessage ? (
              <p className="type-caption text-destructive text-right max-w-[min(100%,220px)] leading-snug">
                {emailMessage}
              </p>
            ) : null}
          </div>
          <Input
            id="auth-login-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn("rounded-chip h-11", emailError && inputErrorRing)}
            placeholder={primary("name@example.com", "name@example.com")}
          />
        </div>
        <div className="space-y-g2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-g2 gap-y-1">
            <label className="type-caption font-medium text-foreground" htmlFor="auth-login-password">
              {primary("비밀번호", "Password")}
            </label>
            {passwordMessage ? (
              <p className="type-caption text-destructive text-right max-w-[min(100%,220px)] leading-snug">
                {passwordMessage}
              </p>
            ) : null}
          </div>
          <Input
            id="auth-login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setCredentialsWrong(false);
            }}
            className={cn(
              "rounded-chip h-11",
              (passwordError || credentialsWrong) && triedSubmit && inputErrorRing,
            )}
          />
        </div>
        <AppButton
          type="submit"
          className={cn(
            "w-full min-h-12 bg-brand-royal text-white shadow-elevate-sm hover:brightness-105",
            "border-0",
          )}
        >
          {primary("로그인", "Log in")}
        </AppButton>
        <p className="type-caption text-center text-muted-foreground">
          {primary("계정이 없으신가요? ", "No account? ")}
          <Link to="/auth/sign-up" className="font-semibold text-brand-royal hover:underline">
            {primary("가입하기", "Sign up")}
          </Link>
        </p>
      </form>
    </div>
  );
}
