import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

export function RewardStampRing({
  current,
  total = 5,
  className,
}: {
  current: number;
  total?: number;
  className?: string;
}) {
  const { primary } = useLanguage();
  const pct = Math.min(100, (current / total) * 100);
  const circumference = 2 * Math.PI * 44;
  const dash = (pct / 100) * circumference;
  const complete = current >= total;

  return (
    <div className={cn("flex flex-col items-center gap-g3", className)}>
      <div className="relative h-28 w-28">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--neutral-lightgray))" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={complete ? "hsl(var(--brand-green))" : "hsl(var(--accent-coral))"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="type-display text-brand-royal leading-none tabular-nums">{current}</span>
          <span className="type-caption text-muted-foreground tabular-nums">/ {total}</span>
        </div>
      </div>
      <p className="type-caption text-center text-muted-foreground px-g4">
        {primary("스탬프 진행", "Stamp progress")}
      </p>
    </div>
  );
}
