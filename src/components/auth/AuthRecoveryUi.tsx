import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** 로그인 화면: 비밀번호 입력 아래 회색 링크 (이메일 찾기 | 비밀번호 찾기) */
export function AuthRecoveryInlineLinks({
  primary,
  className,
}: {
  primary: (ko: string, en: string) => string;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-end items-center gap-1.5 type-caption text-muted-foreground", className)}>
      <Link to="/auth/forgot-email" className="hover:text-foreground hover:underline">
        {primary("이메일 찾기", "Find email")}
      </Link>
      <span className="text-border select-none" aria-hidden>
        |
      </span>
      <Link to="/auth/forgot-password" className="hover:text-foreground hover:underline">
        {primary("비밀번호 찾기", "Find password")}
      </Link>
    </div>
  );
}

/** 비밀번호 찾기 하단: 로그인 / 이메일찾기 / 회원가입 */
export function AuthRecoveryFooterLinks({
  primary,
  hide,
}: {
  primary: (ko: string, en: string) => string;
  hide?: "email" | "password" | "signup";
}) {
  const linkClass = "hover:text-foreground hover:underline";

  return (
    <p className="text-center type-caption text-muted-foreground pt-g6">
      {hide !== "login" ? (
        <>
          <Link to="/auth/login" className={linkClass}>
            {primary("로그인", "Log in")}
          </Link>
          <span className="mx-1.5 text-border">/</span>
        </>
      ) : null}
      {hide !== "email" ? (
        <>
          <Link to="/auth/forgot-email" className={linkClass}>
            {primary("이메일 찾기", "Find email")}
          </Link>
          <span className="mx-1.5 text-border">/</span>
        </>
      ) : null}
      {hide !== "signup" ? (
        <Link to="/auth/sign-up" className={linkClass}>
          {primary("회원가입", "Sign up")}
        </Link>
      ) : null}
    </p>
  );
}

/** 입력 필드 바로 아래 빨간 에러 문구 */
export function AuthFieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="type-caption text-destructive leading-snug">{message}</p>;
}

export function AuthSimpleMessage({
  variant,
  children,
}: {
  variant: "success" | "error" | "muted";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "type-body leading-relaxed",
        variant === "success" && "text-foreground",
        variant === "error" && "text-destructive",
        variant === "muted" && "text-muted-foreground type-caption",
      )}
    >
      {children}
    </p>
  );
}
