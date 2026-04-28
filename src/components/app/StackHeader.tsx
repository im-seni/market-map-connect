import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function StackHeader({ title, right }: { title: ReactNode; right?: ReactNode }) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-g2 border-b border-border bg-card/90 backdrop-blur-md px-g3 py-g3 shadow-elevate-sm min-h-14">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-chip text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
        aria-label="Back"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="type-heading flex-1 truncate min-w-0 pr-g2">{title}</h1>
      {right != null ? <div className="shrink-0 flex items-center">{right}</div> : null}
    </header>
  );
}
