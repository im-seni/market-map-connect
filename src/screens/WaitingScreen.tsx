import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { AppButton } from "@/components/app/AppButton";
import { FilterChip } from "@/components/app/FilterChip";
import type { StoreType } from "@/data/stores";
import { stores } from "@/data/stores";
import { reservationTheme, reservationUrgency } from "@/lib/reservationCardTheme";
import { useQueue } from "@/contexts/QueueContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type WaitFilter = StoreType | "all";

export default function WaitingScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const { tickets, leaveQueue } = useQueue();
  const [waitFilter, setWaitFilter] = useState<WaitFilter>("all");

  const activeQueues = useMemo(
    () =>
      tickets
        .map((t) => ({
          ticket: t,
          store: stores.find((s) => s.id === t.vendorId),
        }))
        .filter(
          (x): x is { ticket: (typeof tickets)[number]; store: NonNullable<(typeof stores)[number]> } =>
            !!x.store
        ),
    [tickets]
  );

  const sortedQueues = useMemo(() => {
    return [...activeQueues].sort((a, b) => {
      const eta = a.ticket.etaMinutes - b.ticket.etaMinutes;
      if (eta !== 0) return eta;
      return a.ticket.peopleAhead - b.ticket.peopleAhead;
    });
  }, [activeQueues]);

  const filteredQueues = useMemo(() => {
    if (waitFilter === "all") return sortedQueues;
    return sortedQueues.filter(({ store }) => store.storeType === waitFilter);
  }, [sortedQueues, waitFilter]);

  const showWalkCta = useMemo(
    () => activeQueues.some(({ ticket }) => ticket.etaMinutes >= 5),
    [activeQueues],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <TopUtilityBar />

      <div className="min-h-0 flex-1 overflow-y-auto px-g4 py-g4">
        <h1 className="type-title font-bold text-foreground">{primary("예약 내역", "Reservations")}</h1>

        {activeQueues.length === 0 ? (
          <div className="mt-g6 space-y-g4 text-center">
            <p className="type-body text-muted-foreground">
              {primary("웨이팅 중인 가게가 없어요.", "You’re not in any queue yet.")}
            </p>
            <AppButton variant="primary" className="w-full max-w-sm mx-auto" onClick={() => navigate("/map")}>
              {primary("지도·다이닝에서 줄 서기", "Browse stores on Maps")}
            </AppButton>
          </div>
        ) : (
          <>
            <div className="mt-g4 flex gap-g2 overflow-x-auto pb-1 no-scrollbar">
              <FilterChip active={waitFilter === "all"} onClick={() => setWaitFilter("all")}>
                {primary("전체", "All")}
              </FilterChip>
              <FilterChip active={waitFilter === "food_court"} onClick={() => setWaitFilter("food_court")}>
                {primary("포장마차", "Stalls")}
              </FilterChip>
              <FilterChip active={waitFilter === "food_truck"} onClick={() => setWaitFilter("food_truck")}>
                {primary("푸드트럭", "Food truck")}
              </FilterChip>
              <FilterChip active={waitFilter === "restaurant"} onClick={() => setWaitFilter("restaurant")}>
                {primary("어시장 식당", "Market dining")}
              </FilterChip>
            </div>
            {filteredQueues.length === 0 ? (
              <p className="mt-g6 type-body text-center text-muted-foreground">
                {primary("이 유형의 웨이팅이 없어요.", "No queues in this category.")}
              </p>
            ) : (
              <div className="mt-g4 space-y-g4">
                {filteredQueues.map(({ ticket, store }) => {
              const urgency = reservationUrgency(ticket.etaMinutes, ticket.peopleAhead);
              const theme = reservationTheme(urgency);
              const initEta = Math.max(1, ticket.initialEtaMinutes);
              const progressToTurn = Math.min(1, Math.max(0, 1 - ticket.etaMinutes / initEta));

              const elapsedMinutes = Math.floor((Date.now() - ticket.joinedAt) / 60000);
              const minutesSinceEtaHitZero =
                ticket.initialEtaMinutes > 0
                  ? Math.max(0, elapsedMinutes - ticket.initialEtaMinutes)
                  : elapsedMinutes;
              const atTurn = ticket.etaMinutes === 0 && ticket.peopleAhead === 0;
              const staleTurn = atTurn && minutesSinceEtaHitZero >= 5;

              const openDetail = () =>
                navigate("/map", { state: { waitingDetailStoreId: store.id, fromWaiting: true } });

                  return (
                    <div
                      key={ticket.vendorId}
                      role="button"
                      tabIndex={0}
                      onClick={openDetail}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openDetail();
                        }
                      }}
                      className={cn(
                        "cursor-pointer rounded-2xl border-2 bg-card p-g4 shadow-sm outline-none transition hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-brand-royal/40",
                        staleTurn ? "border-muted-foreground/45" : theme.ringClass,
                      )}
                    >
                      <div className="flex gap-g3">
                        <div className="relative shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-2xl">
                            {store.emoji}
                          </div>
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-card" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-g3">
                            <div className="min-w-0 flex-1">
                              <p className="type-caption text-muted-foreground">{primary("대기표", "Ticket")}</p>
                              <div className="flex items-start gap-g2">
                                <p
                                  className={cn(
                                    "min-w-0 flex-1 type-body font-bold leading-snug",
                                    staleTurn ? "text-muted-foreground" : "text-foreground",
                                  )}
                                >
                                  #{ticket.queueNumber}
                                  <span className="font-semibold text-muted-foreground"> · </span>
                                  <span className="break-words">{primary(store.name, store.nameEn)}</span>
                                </p>
                                <button
                                  type="button"
                                  className="-mt-2 shrink-0 self-start rounded-pill border border-brand-royal/35 bg-brand-royal/[0.06] px-g3 py-1.5 type-caption font-semibold text-brand-royal transition hover:bg-brand-royal/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    leaveQueue(ticket.vendorId);
                                  }}
                                >
                                  {primary("취소", "Cancel")}
                                </button>
                              </div>
                            </div>
                          </div>

                          <p className="mt-g2 flex flex-wrap items-baseline gap-x-g2 gap-y-1 type-body tabular-nums">
                            <span
                              className={cn(
                                "font-extrabold",
                                staleTurn ? "text-muted-foreground" : theme.numberClass,
                              )}
                            >
                              {primary(`대기 ${ticket.peopleAhead}명`, `${ticket.peopleAhead} ahead`)}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span
                              className={cn(
                                "font-extrabold",
                                staleTurn ? "text-muted-foreground" : theme.numberClass,
                              )}
                            >
                              {primary(`예상 ~${ticket.etaMinutes}분`, `Est. ~${ticket.etaMinutes}m`)}
                            </span>
                          </p>

                          <div className="mt-g3">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-[width] duration-700 ease-out",
                                  staleTurn ? "bg-muted-foreground/35" : theme.accentBarClass,
                                )}
                                style={{ width: `${progressToTurn * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {showWalkCta && (
              <div className="mt-g4">
                <AppButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate("/waiting/walk-route")}
                >
                  {primary("대기 중 추천 루트", "Suggested route while waiting")}
                </AppButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
