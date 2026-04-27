import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className, floating = false }: { className?: string; floating?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-elevate-sm transition hover:bg-secondary",
        floating && "absolute right-g4 top-g4 z-10",
        className
      )}
    >
      <span className="relative block h-5 w-5">
        <Sun
          className={cn(
            "absolute inset-0 h-5 w-5 transition-all duration-300",
            isDark ? "scale-50 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 h-5 w-5 transition-all duration-300",
            isDark ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 -rotate-90"
          )}
        />
      </span>
    </button>
  );
}
