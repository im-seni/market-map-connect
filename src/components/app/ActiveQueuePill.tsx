import { useNavigate } from "react-router-dom";
import { Clock, Users } from "lucide-react";
import { useQueue } from "@/contexts/QueueContext";
import { storeById } from "@/data/stores";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export function ActiveQueuePill() {
  const { tickets } = useQueue();
  const navigate = useNavigate();
  const { primary } = useLanguage();

  if (tickets.length === 0) return null;

  // pick most-imminent (lowest peopleAhead, then lowest eta)
  const sorted = [...tickets].sort(
    (a, b) => a.peopleAhead - b.peopleAhead || a.etaMinutes - b.etaMinutes,
  );
  const t = sorted[0];
  const extra = tickets.length - 1;
  const store = storeById(t.vendorId);
  if (!store) return null;

  const almost = t.peopleAhead <= 1;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[88px] z-30 flex justify-center px-g4">
      <button
        type="button"
        onClick={() => navigate(`/vendor/${t.vendorId}`)}
        className={cn(
          "pointer-events-auto group flex w-full max-w-sm items-center gap-g3 rounded-pill border px-g3 py-g2 text-left shadow-elevate-md backdrop-blur-md transition-all active:scale-[0.98]",
          almost
            ? "border-brand-coral/60 bg-brand-coral/95 text-white animate-pulse"
            : "border-border bg-card/95 text-foreground",
        )}
        aria-label={primary("내 대기 보기", "View my queue")}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg",
            almost ? "bg-white/20" : "bg-brand-royal/15",
          )}
        >
          {store.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-g2">
            <span className="type-caption font-bold tabular-nums">#{t.queueNumber}</span>
            <span className="truncate type-caption font-semibold">
              {primary(store.name, store.nameEn)}
            </span>
            {extra > 0 && (
              <span
                className={cn(
                  "ml-auto rounded-pill px-g2 py-px text-[10px] font-bold",
                  almost ? "bg-white/25 text-white" : "bg-secondary text-muted-foreground",
                )}
              >
                +{extra}
              </span>
            )}
          </div>
          <div
            className={cn(
              "mt-px flex items-center gap-g3 text-[11px] tabular-nums",
              almost ? "text-white/90" : "text-muted-foreground",
            )}
          >
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {almost
                ? primary("곧 차례!", "You're up!")
                : primary(`${t.peopleAhead}명 앞`, `${t.peopleAhead} ahead`)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />~{t.etaMinutes}m
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
