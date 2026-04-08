import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppBottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex max-w-frame mx-auto flex-col justify-end bg-brand-navy/35">
      <button type="button" className="flex-1 min-h-0 w-full cursor-default" aria-label="Close sheet backdrop" onClick={onClose} />
      <div
        className={cn(
          "bg-card rounded-t-sheet shadow-elevate-lg border-t border-border max-h-[72vh] flex flex-col animate-in slide-in-from-bottom duration-200",
          className
        )}
      >
        <div className="flex justify-center pt-g3 pb-g1">
          <span className="h-1 w-10 rounded-pill bg-border" aria-hidden />
        </div>
        <div className="flex items-center justify-between px-g4 pb-g2">
          {title ? <div className="type-heading text-foreground pr-g2">{title}</div> : <div />}
          <button
            type="button"
            onClick={onClose}
            className="rounded-chip p-g2 text-muted-foreground hover:bg-secondary shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-g4 pb-g6 flex-1">{children}</div>
      </div>
    </div>
  );
}
