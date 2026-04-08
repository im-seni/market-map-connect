import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function StackHeader({ title }: { title: ReactNode }) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-g3 border-b border-border bg-card/90 px-g4 py-g3 shadow-elevate-sm">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="rounded-chip p-g2 text-muted-foreground hover:bg-secondary"
        aria-label="Back"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="type-heading flex-1 truncate">{title}</h1>
    </header>
  );
}
