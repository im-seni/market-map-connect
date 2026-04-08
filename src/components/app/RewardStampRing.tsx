import { cn } from "@/lib/utils";

export function RewardStampRing({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  const pct = Math.min(100, (current / total) * 100);
  const circumference = 2 * Math.PI * 44;
  const dash = (pct / 100) * circumference;

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
            stroke="hsl(var(--accent-coral))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="type-display text-brand-royal leading-none">{current}</span>
          <span className="type-caption text-muted-foreground">/ {total}</span>
        </div>
      </div>
      <p className="type-caption text-center text-muted-foreground px-g4">
        스탬프 진행 · Stamp progress
      </p>
    </div>
  );
}

export function MilestoneCard({
  titleKo,
  titleEn,
  unlocked,
}: {
  titleKo: string;
  titleEn: string;
  unlocked: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-card border p-g4 shadow-elevate-sm",
        unlocked ? "border-brand-green/40 bg-brand-green/5" : "border-border bg-secondary/50 opacity-70"
      )}
    >
      <p className="type-body font-semibold text-foreground">
        {titleKo} · {titleEn}
      </p>
      <p className="type-caption text-muted-foreground mt-g1">
        {unlocked ? "해제됨 · Unlocked" : "잠김 · Locked"}
      </p>
    </div>
  );
}
