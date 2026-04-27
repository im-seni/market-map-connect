import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import type { QueueTicket } from "@/contexts/QueueContext";
import type { Store } from "@/data/stores";

export type ActivityState = "in_line" | "up_next" | "almost_up";

/**
 * Map a queue ticket to a single urgency state.
 * Calm by default — only escalates when both metrics agree something is happening soon.
 */
export function getActivityState(t: QueueTicket): ActivityState {
  if (t.peopleAhead <= 1 || t.etaMinutes < 5) return "almost_up";
  if (t.peopleAhead <= 4 || t.etaMinutes <= 10) return "up_next";
  return "in_line";
}

/** 0–1 progress from join time to served. Always monotonically increasing. */
function getProgress(t: QueueTicket): number {
  const start = Math.max(t.initialPeopleAhead, t.peopleAhead + 1, 1);
  const consumed = start - t.peopleAhead;
  return Math.max(0, Math.min(1, consumed / start));
}

const stateClasses: Record<
  ActivityState,
  {
    cardBorder: string;
    dot: string;
    dotPulse: boolean;
    chip: string;
    chipPulse: boolean;
    numbers: string;
    progressFill: string;
  }
> = {
  in_line: {
    cardBorder: "border-border",
    dot: "bg-brand-royal",
    dotPulse: false,
    chip: "bg-secondary text-foreground border-border",
    chipPulse: false,
    numbers: "text-foreground",
    progressFill: "bg-brand-royal",
  },
  up_next: {
    cardBorder: "border-border",
    dot: "bg-brand-yellow",
    dotPulse: false,
    chip: "bg-brand-yellow/25 text-brand-navy border-brand-yellow/60",
    chipPulse: false,
    numbers: "text-brand-navy",
    progressFill: "bg-brand-yellow",
  },
  almost_up: {
    cardBorder: "border-2 border-accent",
    dot: "bg-accent",
    dotPulse: true,
    chip: "bg-accent text-white border-accent",
    chipPulse: true,
    numbers: "text-accent",
    progressFill: "bg-accent",
  },
};

interface Props {
  ticket: QueueTicket;
  store: Store;
}

export function ActivityCard({ ticket, store }: Props) {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const state = getActivityState(ticket);
  const s = stateClasses[state];
  const progress = getProgress(ticket);

  const statusLabel =
    state === "almost_up"
      ? primary("⚡ 거의 도착", "⚡ Almost up")
      : state === "up_next"
        ? primary("곧 차례", "Up next")
        : primary("대기 중", "In line");

  return (
    <button
      type="button"
      onClick={() => navigate(`/vendor/${ticket.vendorId}`)}
      className={cn(
        "w-full text-left rounded-card bg-card p-g4 shadow-elevate-sm transition-shadow hover:shadow-elevate-md active:scale-[0.99]",
        s.cardBorder,
        // For non-almost states keep a single border line; almost adds the 2px above.
        state !== "almost_up" && "border",
      )}
      aria-label={primary(
        `${store.name} 대기 상세 보기`,
        `View ${store.nameEn} queue details`,
      )}
    >
      <div className="flex items-start justify-between gap-g3 mb-g3">
        <div className="flex items-center gap-g2 min-w-0">
          <div className="relative h-10 w-10 shrink-0 rounded-full bg-secondary flex items-center justify-center text-xl">
            <span aria-hidden>{store.emoji}</span>
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card",
                s.dot,
                s.dotPulse && "animate-pulse",
              )}
              aria-hidden
            />
          </div>
          <div className="min-w-0">
            <p className="type-caption uppercase tracking-wide text-muted-foreground">
              {primary("대기표", "Ticket")}
            </p>
            <p className="type-body font-bold tabular-nums leading-tight text-foreground truncate">
              #{ticket.queueNumber} · {primary(store.name, store.nameEn)}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 inline-flex items-center rounded-pill border px-g2 py-g1 type-caption font-bold whitespace-nowrap",
            s.chip,
            s.chipPulse && "animate-pulse",
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex justify-between items-end mb-g2">
        <div>
          <p className="type-caption text-muted-foreground">
            {primary("대기 인원", "Ahead")}
          </p>
          <p className={cn("type-display font-bold tabular-nums leading-none", s.numbers)}>
            {ticket.peopleAhead}
          </p>
        </div>
        <div className="text-right">
          <p className="type-caption text-muted-foreground">{primary("예상", "ETA")}</p>
          <p className={cn("type-display font-bold tabular-nums leading-none", s.numbers)}>
            ~{ticket.etaMinutes}m
          </p>
        </div>
      </div>

      <div
        className="h-1.5 w-full bg-secondary rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", s.progressFill)}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </button>
  );
}
