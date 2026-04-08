import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PhoneFrame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "phone-frame flex min-h-dvh flex-col bg-background text-foreground shadow-elevate-lg overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
