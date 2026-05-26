import type { Ref } from "react";
import { Star, ChevronLeft, Clock, Users, Ticket, Filter, Heart } from "lucide-react";
import { AppButton } from "@/components/app/AppButton";
import { type Store, getBakeryStock } from "@/data/stores";
import type { QueueTicket } from "@/contexts/QueueContext";
import { cn } from "@/lib/utils";

export type WaitStyle = { border: string; halo: string; badge?: string };

export type DiningStoreDetailScrollProps = {
  store: Store;
  variant: "sheet" | "listPage";
  scrollRef?: Ref<HTMLDivElement>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onBack: () => void;
  backLabelKo: string;
  backLabelEn: string;
  primary: (ko: string, en: string) => string;
  formatStoreAddress: (s: Store, p: (ko: string, en: string) => string) => string;
  storePhotosById: Record<string, string[]>;
  selectedWaitStyle: WaitStyle | null;
  ticket?: QueueTicket;
  menuExpanded: boolean;
  onMenuExpandedToggle: () => void;
  reviewsExpanded: boolean;
  onReviewsExpandedToggle: () => void;
  visibleReviews: Store["reviews"];
  reviewsSource: Store["reviews"];
  reviewAppliedMenus: string[];
  onOpenReviewMenu: () => void;
  detailExpanded: boolean;
  queueFooterInline: boolean;
  onQueueJoin: () => void;
  onQueueLeave: () => void;
  isGuest?: boolean;
  /** 저장(하트) — 미전달 시 버튼 숨김 */
  saved?: boolean;
  onToggleSaved?: () => void;
};

function QueueReserveFooter({
  ticket,
  primary,
  onQueueJoin,
  onQueueLeave,
  isGuest,
}: {
  ticket?: QueueTicket;
  primary: (ko: string, en: string) => string;
  onQueueJoin: () => void;
  onQueueLeave: () => void;
  isGuest?: boolean;
}) {
  return (
    <div className="border-t border-border bg-card px-g4 py-g3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
      {ticket ? (
        <div className="rounded-card border border-border bg-background px-g3 py-g2 shadow-elevate-sm">
          <div className="flex items-center justify-center gap-g2 text-brand-royal">
            <Ticket className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span className="type-title font-bold tabular-nums">#{ticket.queueNumber}</span>
          </div>
          <button type="button" onClick={onQueueLeave} className="type-caption mt-g2 w-full font-semibold text-brand-royal underline">
            {primary("대기 취소 · Cancel", "Cancel reservation")}
          </button>
        </div>
      ) : isGuest ? (
        <p className="type-caption text-center text-muted-foreground py-g2">
          로그인 후 줄서기 기능을 이용해보세요
        </p>
      ) : (
        <AppButton variant="primary" onClick={onQueueJoin} className="w-full">
          {primary("예약하기", "Reserve")}
        </AppButton>
      )}
    </div>
  );
}

export function DiningStoreDetailScroll({
  store,
  variant,
  scrollRef,
  onScroll,
  onBack,
  backLabelKo,
  backLabelEn,
  primary,
  formatStoreAddress,
  storePhotosById,
  selectedWaitStyle,
  ticket,
  menuExpanded,
  onMenuExpandedToggle,
  reviewsExpanded,
  onReviewsExpandedToggle,
  visibleReviews,
  reviewsSource,
  reviewAppliedMenus,
  onOpenReviewMenu,
  detailExpanded,
  queueFooterInline,
  onQueueJoin,
  onQueueLeave,
  isGuest,
  saved,
  onToggleSaved,
}: DiningStoreDetailScrollProps) {
  const px = "px-g4";

  const main = (
    <>
      <div className="pb-g3 border-b border-border">
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 type-caption text-muted-foreground",
            variant === "listPage" ? "mb-g4" : "mb-g2"
          )}
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" />
          {primary(backLabelKo, backLabelEn)}
        </button>
        <div
          className={cn(
            "flex items-start justify-between gap-g2",
            variant === "listPage" && queueFooterInline && "mt-g1"
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-g2">
            <span className="text-2xl shrink-0">{store.emoji}</span>
            <h2 className="type-title truncate text-foreground">{primary(store.name, store.nameEn)}</h2>
          </div>
          {onToggleSaved != null && (
            <button
              type="button"
              onClick={onToggleSaved}
              className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-brand-coral"
              aria-label={primary(
                saved ? "저장 취소" : "상점 저장",
                saved ? "Remove from saved" : "Save vendor",
              )}
            >
              <Heart
                className={cn("h-5 w-5", saved && "fill-brand-coral text-brand-coral")}
                strokeWidth={1.75}
              />
            </button>
          )}
        </div>
        <p className="type-caption text-muted-foreground mt-g2">{formatStoreAddress(store, primary)}</p>

        {store.storeType === "bakery" && (() => {
          const stock = getBakeryStock(store);
          const isLow = stock != null && stock > 0 && stock <= 10;
          const isSoldOut = stock === 0;
          return (
            <div className="mt-g3 rounded-card border border-amber-500/40 bg-amber-500/10 p-g3">
              <div className="flex items-center gap-g2">
                <span className="text-xl shrink-0">🎁</span>
                <p className="type-body font-bold text-amber-700">{primary("무료 소금빵 증정!", "Free salt bread!")}</p>
              </div>
              <p className="mt-1 type-caption text-muted-foreground">
                {primary("방문 시 1인 1개 · 소진 시 종료", "1 per person · while supplies last")}
              </p>
              {stock != null && (
                <p className={cn(
                  "mt-g2 text-xl font-extrabold tabular-nums",
                  isSoldOut ? "text-destructive" : isLow ? "text-amber-600" : "text-emerald-600",
                )}>
                  {isSoldOut
                    ? primary("현재 품절", "Currently sold out")
                    : isLow
                      ? primary(`마감 임박 · ${stock}개 남음`, `Almost gone · ${stock} left`)
                      : primary(`${stock}개 남음`, `${stock} remaining`)}
                </p>
              )}
            </div>
          );
        })()}
        <div className="mt-g3 grid grid-cols-2 gap-g2">
          <div className="flex items-center gap-g2 rounded-card border border-border bg-secondary/40 p-g3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="type-caption leading-tight text-muted-foreground">
                {primary("예상 대기 · Est. wait", "Est. wait")}
              </p>
              <p
                className="type-body font-extrabold tabular-nums"
                style={{ color: selectedWaitStyle?.border ?? "#faad14" }}
              >
                {ticket
                  ? primary(`${ticket.etaMinutes}분`, `${ticket.etaMinutes}m`)
                  : primary(`${store.waitTime}분`, `${store.waitTime}m`)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-g2 rounded-card border border-border bg-secondary/40 p-g3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <Users className="h-4 w-4 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="type-caption leading-tight text-muted-foreground">
                {primary("대기 중 · In line", "In line")}
              </p>
              <p className="type-body font-extrabold tabular-nums text-foreground">
                {ticket
                  ? primary(`${ticket.peopleAhead}명`, `${ticket.peopleAhead}`)
                  : primary(`${store.queueCount}명`, `${store.queueCount}`)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="no-scrollbar overflow-x-auto py-g3">
        <div className="flex gap-g2">
          {(storePhotosById[store.id] ?? []).map((src, idx) => (
            <img
              key={`${store.id}-${idx}`}
              src={src}
              alt={store.name}
              className="h-28 w-40 rounded-lg object-cover"
            />
          ))}
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border py-g3">
        {(store.vibeTags ?? []).map((tag, idx) => (
          <span
            key={`${store.id}-tag-${idx}`}
            className="type-caption shrink-0 rounded-pill bg-secondary px-g3 py-g1 font-semibold text-foreground"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="border-b border-border py-g4">
        <p className="type-caption mb-g2 font-semibold uppercase text-muted-foreground">
          {primary("한줄 소개", "One-liner")}
        </p>
        <p className="type-body text-foreground">
          {store.tagline
            ? primary(store.tagline.ko, store.tagline.en)
            : primary(store.description, store.descriptionEn)}
        </p>
      </div>

      <div className="space-y-g2 border-b border-border py-g4">
        <p className="type-caption font-semibold uppercase text-muted-foreground">
          {primary("주요 메뉴", "Main menu")}
        </p>
        {(menuExpanded ? store.menu : store.menu.slice(0, 5)).map((m) => (
          <div key={m.name} className="flex items-center justify-between gap-g2">
            <div className="flex min-w-0 items-center gap-g2">
              <span className="type-body truncate">{primary(m.name, m.nameEn)}</span>
              {m.popular && (
                <span className="shrink-0 rounded-pill bg-brand-coral/15 px-g2 py-px text-[10px] font-bold text-brand-coral">
                  {primary("인기", "Popular")}
                </span>
              )}
              {m.soldOut && (
                <span className="shrink-0 rounded-pill bg-muted px-g2 py-px text-[10px] font-bold text-muted-foreground">
                  {primary("품절", "Sold out")}
                </span>
              )}
            </div>
            <span className="type-body shrink-0 tabular-nums font-semibold text-brand-royal">
              {m.price.toLocaleString()}₩
            </span>
          </div>
        ))}
        {store.menu.length > 5 && (
          <button
            type="button"
            className="type-caption mt-g2 w-full rounded-pill border border-border bg-secondary py-g2 font-semibold text-foreground transition hover:bg-muted"
            onClick={onMenuExpandedToggle}
          >
            {menuExpanded ? primary("메뉴 접기", "Show less") : primary("메뉴 더보기", "More menu")}
          </button>
        )}
      </div>

      <div className={cn("pt-g4", variant === "sheet" && detailExpanded && "pb-g2")}>
        <div className="mb-g3 flex w-full items-center justify-between gap-g3">
          <p className="type-caption font-semibold uppercase text-muted-foreground">
            {primary("리뷰", "Reviews")}
          </p>
          <button
            type="button"
            onClick={onOpenReviewMenu}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-border bg-secondary px-g3 py-1 type-caption font-semibold text-foreground transition hover:bg-muted"
          >
            <Filter className="h-3.5 w-3.5 shrink-0" />
            {primary("메뉴", "Menu")}
            {reviewAppliedMenus.length > 0 && (
              <span className="tabular-nums text-brand-royal">({reviewAppliedMenus.length})</span>
            )}
          </button>
        </div>

        {visibleReviews.length === 0 ? (
          <p className="type-caption py-g4 text-center text-muted-foreground">
            {primary("아직 리뷰가 없어요", "No reviews yet")}
          </p>
        ) : (
          <div className="space-y-g4">
            {visibleReviews.map((r) => (
              <div key={r.id} className="space-y-g1">
                <div className="flex items-center justify-between">
                  <span className="type-caption font-semibold">{r.userName}</span>
                  <span className="type-caption text-muted-foreground">{r.date}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < r.rating ? "fill-brand-royal text-brand-royal" : "fill-border text-border"
                      )}
                    />
                  ))}
                </div>
                <p className="type-body text-foreground">{primary(r.comment, r.commentEn)}</p>
              </div>
            ))}
          </div>
        )}
        {reviewsSource.length > 5 && (
          <button
            type="button"
            className="type-caption mt-g3 w-full rounded-pill border border-border bg-secondary py-g2 font-semibold text-foreground transition hover:bg-muted"
            onClick={onReviewsExpandedToggle}
          >
            {reviewsExpanded ? primary("리뷰 접기", "Fewer reviews") : primary("리뷰 더보기", "More reviews")}
          </button>
        )}
      </div>
    </>
  );

  /** 목록 전체: 스크롤 + 하단 고정 예약(바텀시트와 동일) */
  if (variant === "listPage" && queueFooterInline) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          className={cn("min-h-0 flex-1 overflow-y-auto", px, "pb-g4 pt-g5")}
          onScroll={onScroll}
        >
          {main}
        </div>
        <QueueReserveFooter
          ticket={ticket}
          primary={primary}
          onQueueJoin={onQueueJoin}
          onQueueLeave={onQueueLeave}
          isGuest={isGuest}
        />
      </div>
    );
  }

  return (
    <div ref={scrollRef} className={cn("min-h-0 flex-1 overflow-y-auto", px)} onScroll={onScroll}>
      {main}
      {queueFooterInline && (
        <div className="mt-g4 border-t border-border pt-g4 pb-g8">
          {ticket ? (
            <div className="rounded-card border border-border bg-card px-g3 py-g2 shadow-elevate-sm">
              <div className="flex items-center justify-center gap-g2 text-brand-royal">
                <Ticket className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="type-title font-bold tabular-nums">#{ticket.queueNumber}</span>
              </div>
              <button type="button" onClick={onQueueLeave} className="type-caption mt-g2 w-full font-semibold text-brand-royal underline">
                {primary("대기 취소 · Cancel", "Cancel reservation")}
              </button>
            </div>
          ) : isGuest ? (
            <p className="type-caption text-center text-muted-foreground py-g2">
              로그인 후 줄서기 기능을 이용해보세요
            </p>
          ) : (
            <AppButton variant="primary" onClick={onQueueJoin} className="w-full">
              {primary("예약하기", "Reserve")}
            </AppButton>
          )}
        </div>
      )}
    </div>
  );
}
