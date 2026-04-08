import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Locale = "ko" | "en";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Primary string follows locale; secondary line shows the other language. */
  primary: (ko: string, en: string) => string;
  secondary: (ko: string, en: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ko");

  const primary = useCallback(
    (ko: string, en: string) => (locale === "ko" ? ko : en),
    [locale]
  );

  const secondary = useCallback(
    (ko: string, en: string) => (locale === "ko" ? en : ko),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, primary, secondary }),
    [locale, primary, secondary]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** Spec-style inline pair: "행사 안내 · Events" */
export function PairedInline({ ko, en, className = "" }: { ko: string; en: string; className?: string }) {
  return (
    <span className={`type-caption text-foreground ${className}`}>
      <span lang="ko">{ko}</span>
      <span className="text-muted-foreground font-normal"> · </span>
      <span lang="en" className="text-muted-foreground">
        {en}
      </span>
    </span>
  );
}
