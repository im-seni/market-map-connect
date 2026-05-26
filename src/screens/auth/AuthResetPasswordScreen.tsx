import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { AppButton } from "@/components/app/AppButton";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const inputErrorRing = "border-2 border-destructive focus-visible:ring-destructive/30";

export default function AuthResetPasswordScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const { updatePassword } = useSupabaseAuth();
  const [linkStatus, setLinkStatus] = useState<"verifying" | "ready" | "expired">("verifying");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const markReady = () => {
      if (!cancelled) setLinkStatus("ready");
    };

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) markReady();
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        markReady();
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });

    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setLinkStatus((s) => (s === "verifying" ? "expired" : s));
      }
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const mismatch = useMemo(
    () => password.length > 0 && confirm.length > 0 && password !== confirm,
    [password, confirm],
  );

  const passwordError = useMemo(
    () => triedSubmit && (!password || password.length < 8),
    [triedSubmit, password],
  );
  const confirmError = useMemo(
    () => triedSubmit && (!confirm || mismatch),
    [triedSubmit, confirm, mismatch],
  );

  const passwordMessage = useMemo(() => {
    if (!triedSubmit) return null;
    if (!password) return primary("비밀번호를 입력해 주세요.", "Enter a password.");
    if (password.length < 8) {
      return primary("비밀번호는 8자 이상으로 입력해 주세요.", "Use at least 8 characters.");
    }
    if (mismatch) return primary("비밀번호가 일치하지 않아요.", "Passwords do not match.");
    return null;
  }, [triedSubmit, password, mismatch, primary]);

  const confirmMessage = useMemo(() => {
    if (!triedSubmit) return null;
    if (!confirm) return primary("비밀번호 확인을 입력해 주세요.", "Confirm your password.");
    if (mismatch) return primary("비밀번호가 일치하지 않아요.", "Passwords do not match.");
    return null;
  }, [triedSubmit, confirm, mismatch, primary]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    setSubmitError(null);
    if (!password || password.length < 8 || !confirm || mismatch) return;

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }
    setDone(true);
    await supabase.auth.signOut();
  };

  if (linkStatus === "verifying") {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <StackHeader title={primary("새 비밀번호", "New password")} />
        <div className="flex-1 px-g4 py-g5 space-y-g4">
          <p className="type-body text-muted-foreground">
            {primary("링크를 확인하는 중…", "Verifying your link…")}
          </p>
        </div>
      </div>
    );
  }

  if (linkStatus === "expired") {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <StackHeader title={primary("새 비밀번호", "New password")} />
        <div className="flex-1 px-g4 py-g5 space-y-g4">
          <p className="type-body text-foreground">
            {primary(
              "링크가 만료되었거나 잘못되었어요. 비밀번호 찾기에서 다시 요청해 주세요.",
              "This link is invalid or expired. Request a new reset link.",
            )}
          </p>
          <Link to="/auth/forgot-password" className="type-caption font-semibold text-brand-royal hover:underline">
            {primary("비밀번호 찾기로 이동", "Go to forgot password")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <StackHeader title={primary("새 비밀번호 설정", "Set new password")} />
      <div className="flex-1 overflow-y-auto px-g4 py-g5 space-y-g5">
        {done ? (
          <div className="space-y-g4 rounded-card border border-border bg-card p-g4">
            <p className="type-body text-foreground">
              {primary("비밀번호가 변경되었어요. 새 비밀번호로 로그인해 주세요.", "Password updated. Please log in.")}
            </p>
            <AppButton
              type="button"
              className={cn(
                "w-full min-h-12 bg-brand-royal text-white shadow-elevate-sm hover:brightness-105",
                "border-0",
              )}
              onClick={() => navigate("/auth/login")}
            >
              {primary("로그인", "Log in")}
            </AppButton>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-g4" noValidate>
            {submitError ? (
              <p className="type-caption text-destructive">{submitError}</p>
            ) : null}
            <div className="space-y-g2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-g2 gap-y-1">
                <label className="type-caption font-medium text-foreground" htmlFor="auth-reset-password">
                  {primary("새 비밀번호 (8자 이상)", "New password (8+ chars)")}
                </label>
                {passwordMessage ? (
                  <p className="type-caption text-destructive text-right max-w-[min(100%,220px)] leading-snug">
                    {passwordMessage}
                  </p>
                ) : null}
              </div>
              <Input
                id="auth-reset-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn("rounded-chip h-11", passwordError && inputErrorRing)}
                minLength={8}
              />
            </div>
            <div className="space-y-g2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-g2 gap-y-1">
                <label className="type-caption font-medium text-foreground" htmlFor="auth-reset-confirm">
                  {primary("비밀번호 확인", "Confirm password")}
                </label>
                {confirmMessage ? (
                  <p className="type-caption text-destructive text-right max-w-[min(100%,220px)] leading-snug">
                    {confirmMessage}
                  </p>
                ) : null}
              </div>
              <Input
                id="auth-reset-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={cn("rounded-chip h-11", confirmError && inputErrorRing)}
              />
            </div>
            <AppButton
              type="submit"
              disabled={submitting}
              className={cn(
                "w-full min-h-12 bg-brand-royal text-white shadow-elevate-sm hover:brightness-105",
                "border-0",
              )}
            >
              {submitting ? primary("저장 중…", "Saving…") : primary("비밀번호 변경", "Update password")}
            </AppButton>
          </form>
        )}
      </div>
    </div>
  );
}
