import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { AppButton } from "@/components/app/AppButton";
import { FilterChip } from "@/components/app/FilterChip";
import type { StoreType } from "@/data/stores";
import { stores } from "@/data/stores";
import { reservationTheme, reservationUrgency } from "@/lib/reservationCardTheme";
import { useQueue } from "@/contexts/QueueContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import logoCharacter from "@/assets/logo/character.png";

type WaitFilter = StoreType | "all";

export default function WaitingScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const { user } = useSupabaseAuth();
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

  if (!user) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <TopUtilityBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-g4 px-g6 text-center">
          <img src={logoCharacter} alt="" aria-hidden className="h-24 w-24 object-contain opacity-80" />
          <p className="type-body text-muted-foreground text-pretty">
            {primary(
              "로그인하고 줄서기를 이용해보세요.",
              "Sign in to join the queue.",
            )}
          </p>
          <AppButton
            variant="primary"
            className="w-full max-w-sm"
            onClick={() => navigate("/auth/login")}
          >
            {primary("로그인하러 가기", "Sign in")}
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <TopUtilityBar />

      <div className="min-h-0 flex-1 overflow-y-auto px-g4 py-g4">
        <h1 className="type-title font-bold text-foreground">{primary("예약 내역", "Reservations")}</h1>
        <p className="mt-g3 type-caption text-muted-foreground">
          {primary(
            "입장 안내 후 5분이 지나면 줄서기가 자동으로 취소돼요.",
            "Reservations are auto-cancelled 5 min after your turn.",
          )}
        </p>

        {activeQueues.length === 0 ? (
          <div className="mt-g6 space-y-g4 text-center flex flex-col items-center">
            <img src={logoCharacter} alt="" aria-hidden className="h-20 w-20 object-contain opacity-70" />
            <p className="type-body text-muted-foreground">
              {primary("웨이팅 중인 가게가 없어요.", "You’re not in any queue yet.")}
            </p>
            <AppButton variant="primary" className="w-full max-w-sm" onClick={() => navigate("/map")}>
              {primary("지도·다이닝에서 줄 서기", "Browse stores on Maps")}
            </AppButton>
          </div>
        ) : (
          <>
            <div className="mt-g4 flex gap-g2 overflow-x-auto pb-1 no-scrollbar">
              <FilterChip active={waitFilter === "all"} onClick={() => setWaitFilter("all")}>
                {primary("전체", "All")}
              </FilterChip>
              <FilterChip active={waitFilter === "bakery"} onClick={() => setWaitFilter("bakery")}>
                {primary("🥐 팝업 베이커리", "Popup Bakery")}
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
                            {atTurn && (
                              <p className={cn(
                                "mt-g2 type-caption",
                                staleTurn ? "text-muted-foreground" : "text-amber-600 font-semibold",
                              )}>
                                {staleTurn
                                  ? primary("입장 시간이 지나 곧 자동 취소돼요.", "Reservation expiring — time limit passed.")
                                  : primary("지금 입장 차례예요! 5분 내에 오지 않으면 자동 취소돼요.", "It's your turn! Auto-cancelled after 5 min if you don't arrive.")}
                              </p>
                            )}
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
                  variant="primary"
                  className="w-full shadow-elevate-sm"
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
