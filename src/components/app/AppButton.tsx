import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "tertiary";

const base =
  "inline-flex items-center justify-center gap-g2 min-h-11 px-g5 rounded-chip type-body font-semibold transition-[transform,background-color,filter,box-shadow] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-elevate-sm hover:brightness-105",
  secondary:
    "bg-card text-foreground border border-border shadow-elevate-sm hover:bg-secondary",
  tertiary:
    "bg-transparent text-brand-royal min-h-10 px-g3 underline-offset-4 hover:underline",
};

export function AppButton({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={cn(base, variants[variant], className)} {...props} />;
}
