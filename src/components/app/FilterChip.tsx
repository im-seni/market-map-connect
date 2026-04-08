import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterChip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-pill border px-g4 py-g2 type-caption font-medium transition",
        active
          ? "border-brand-royal bg-brand-royal text-white shadow-elevate-sm"
          : "border-border bg-card text-foreground hover:border-brand-royal/40",
        className
      )}
    >
      {children}
    </Comp>
  );
}
