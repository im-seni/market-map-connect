import { useNavigate } from "react-router-dom";
import { AppButton } from "@/components/app/AppButton";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { ThemeToggle } from "@/components/app/ThemeToggle";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1S8.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.7 2.5 2.4 6.8 2.4 12.1S6.7 21.7 12 21.7c6.9 0 9.5-4.8 9.5-7.3 0-.5-.05-.9-.1-1.3H12z"/>
      <path fill="#34A853" d="M3.6 7.5l3.2 2.4C7.7 7.9 9.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 8.3 2.5 5.1 4.6 3.6 7.5z" opacity=".0"/>
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.43 2.22-1.16 3-.78.85-2.06 1.5-3.13 1.42-.13-1.1.43-2.27 1.13-3.05.79-.88 2.16-1.55 3.16-1.37zM20.5 17.04c-.55 1.27-.81 1.84-1.51 2.97-.97 1.56-2.34 3.5-4.04 3.51-1.51.02-1.9-.99-3.95-.98-2.05.01-2.48.99-3.99.97-1.7-.02-3-1.78-3.97-3.34-2.71-4.4-3-9.55-1.32-12.3 1.18-1.95 3.05-3.09 4.81-3.09 1.79 0 2.91.99 4.39.99 1.43 0 2.31-.99 4.38-.99 1.56 0 3.21.85 4.39 2.32-3.86 2.12-3.23 7.64.81 9.94z"/>
    </svg>
  );
}

function KakaoGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path fill="#191919" d="M12 3C6.5 3 2 6.5 2 10.8c0 2.7 1.8 5.1 4.6 6.5l-1 3.6c-.1.3.3.6.6.4l4.3-2.8c.5.05 1 .07 1.5.07 5.5 0 10-3.5 10-7.7S17.5 3 12 3z"/>
    </svg>
  );
}

export default function LoginScreen() {
  const navigate = useNavigate();
  const goHome = () => navigate("/home");

  const socials: { name: string; bg: string; ring?: string; node: JSX.Element }[] = [
    { name: "Kakao", bg: "bg-[#FEE500]", node: <KakaoGlyph /> },
    { name: "Apple", bg: "bg-black", node: <AppleGlyph /> },
    { name: "Google", bg: "bg-white", ring: "ring-1 ring-border", node: <GoogleGlyph /> },
  ];

  return (
    <PhoneFrame className="min-h-dvh bg-background relative">
      <ThemeToggle floating />
      <div className="flex flex-1 flex-col justify-center px-g6 space-y-g8">
        <div className="text-center">
          <h1 className="type-display text-foreground text-balance">안녕하세요 · Hello</h1>
          <p className="type-body text-muted-foreground mt-g3 text-pretty">제물포구 야시장에 오신 것을 환영합니다!</p>
          <p className="type-body text-muted-foreground text-pretty">Welcome to Jemulpogu Night Market!</p>
        </div>
        <div className="space-y-g3">
          <AppButton variant="primary" className="w-full" onClick={goHome}>
            로그인 · Log In
          </AppButton>
          <AppButton variant="secondary" className="w-full" onClick={goHome}>
            가입하기 · Sign Up
          </AppButton>
          <button
            type="button"
            onClick={goHome}
            className="w-full type-body font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            게스트로 계속 · Continue as Guest
          </button>
        </div>
      </div>
      <div className="px-g6 pb-g8 space-y-g4">
        <div className="flex items-center gap-g3">
          <span className="h-px flex-1 bg-border" />
          <p className="type-caption text-muted-foreground">간편 로그인 · Quick login</p>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="flex justify-center gap-g4">
          {socials.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={goHome}
              aria-label={`${s.name} 로그인`}
              className={`flex h-12 w-12 items-center justify-center rounded-full shadow-elevate-sm transition active:scale-95 ${s.bg} ${s.ring ?? ""}`}
            >
              {s.node}
            </button>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
