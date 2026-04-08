import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "tertiary";

const base =
  "inline-flex items-center justify-center gap-g2 min-h-[48px] px-g5 rounded-chip type-body font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-brand-coral text-white shadow-elevate-sm hover:brightness-105",
  secondary:
    "bg-transparent text-brand-navy border-2 border-brand-navy hover:bg-brand-navy/5",
  tertiary: "bg-transparent text-brand-royal min-h-[44px] px-g2 underline-offset-4 hover:underline",
};

export function AppButton({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={cn(base, variants[variant], className)} {...props} />;
}
