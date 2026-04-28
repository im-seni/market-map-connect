import { Link, useNavigate, useParams } from "react-router-dom";
import { Clock, CreditCard, Heart, Star, Users, Ticket, Stamp as StampIcon, Check } from "lucide-react";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { AppButton } from "@/components/app/AppButton";
import { FilterChip } from "@/components/app/FilterChip";
import { CrowdChip, VendorStatusChip } from "@/components/app/StatusChip";
import { storeById, inferCrowdLevel, getVendorStatus, waitTimeColorClass } from "@/data/stores";
import { useQueue } from "@/contexts/QueueContext";
import { useRewards } from "@/contexts/RewardsContext";
import { useSavedStores } from "@/contexts/SavedStoresContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/NotFound";

const crowdLabels = {
  low: { ko: "여유", en: "Low" },
  moderate: { ko: "보통", en: "Moderate" },
  busy: { ko: "혼잡", en: "Busy" },
} as const;

const vendorLabels = {
  open: { ko: "영업 중", en: "Open" },
  pre_open: { ko: "영업 전", en: "Before opening" },
  closed: { ko: "영업 마감", en: "Closed" },
  sold_out: { ko: "품절", en: "Sold Out" },
} as const;

export default function VendorDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const store = id ? storeById(id) : undefined;
  const { user } = useSupabaseAuth();
  const { ticketFor, joinQueue, leaveQueue } = useQueue();
  const { addStamp, hasStampedToday, count, total } = useRewards();
  const { isSaved, toggleSaved } = useSavedStores();

  if (!store) return <NotFound />;

  const ticket = ticketFor(store.id);
  const isQueued = !!ticket;
  const queueNumber = ticket?.queueNumber ?? null;
  const peopleAhead = ticket?.peopleAhead ?? store.queueCount;
  const displayQueueCount = isQueued ? store.queueCount + 1 : store.queueCount;

  const crowd = inferCrowdLevel(store);
  const status = getVendorStatus(store);
  const c = crowdLabels[crowd];
  const v = vendorLabels[status];

  const handleQueue = () => {
    if (!user) { window.alert("로그인 후 이용 가능합니다."); return; }
    if (isQueued) return;
    const n = store.queueCount + 1;
    joinQueue(store.id, {
      queueNumber: n,
      peopleAhead: store.queueCount,
      etaMinutes: store.waitTime,
    });
  };

  const saved = isSaved(store.id);

  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader
        title={`${store.emoji} ${store.name}`}
        right={
          <button
            type="button"
            onClick={() => toggleSaved(store.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-brand-coral"
            aria-label={primary(saved ? "저장 취소" : "상점 저장", saved ? "Remove from saved" : "Save vendor")}
          >
            <Heart className={cn("h-5 w-5", saved && "fill-brand-coral text-brand-coral")} strokeWidth={1.75} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-g4 py-g4 space-y-g5 pb-g8">
        <div className="flex flex-wrap gap-g2">
          <CrowdChip kind={crowd} labelKo={c.ko} labelEn={c.en} />
          <VendorStatusChip kind={status} labelKo={v.ko} labelEn={v.en} />
        </div>
        <p className="type-body text-muted-foreground">{store.description}</p>
        <p className="type-caption text-muted-foreground">{store.descriptionEn}</p>

        {store.vibeTags && store.vibeTags.length > 0 && (
          <div>
            <p className="type-caption font-semibold mb-g2">무드 태그 · Vibe</p>
            <div className="flex flex-wrap gap-g2">
              {store.vibeTags.map((t, i) => (
                <FilterChip key={t}>
                  {t} · {store.vibeTagsEn?.[i] ?? t}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-g3">
          <div className="rounded-card border border-border bg-secondary p-g3 flex gap-g2 items-center shadow-elevate-sm">
            <Clock className={`h-5 w-5 shrink-0 ${waitTimeColorClass(store.waitTime)}`} />
            <div>
              <p className="type-caption text-muted-foreground">예상 대기 · Est. wait</p>
              <p className={`type-body font-semibold tabular-nums ${waitTimeColorClass(store.waitTime)}`}>
                {store.waitTime}분 · {store.waitTime}m
              </p>
            </div>
          </div>
          <div className="rounded-card border border-border bg-secondary p-g3 flex gap-g2 items-center shadow-elevate-sm">
            <Users className="h-5 w-5 text-brand-coral shrink-0" />
            <div>
              <p className="type-caption text-muted-foreground">대기 중 · In line</p>
              <p className="type-body font-semibold tabular-nums">{displayQueueCount}명 · {displayQueueCount}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-g2 text-brand-royal">
          <Star className="h-5 w-5 fill-brand-royal" />
          <span className="type-heading">{store.rating}</span>
          <span className="type-caption text-muted-foreground">평점 · Rating</span>
        </div>

        <div className="rounded-card border border-border p-g4 flex items-center gap-g3 shadow-elevate-sm">
          <CreditCard className="h-6 w-6 text-brand-navy" />
          <div className="flex-1">
            <p className="type-body font-semibold">결제 수단 · Payment</p>
            <p className="type-caption text-muted-foreground">카드 · 간편결제 · 현장 현금</p>
          </div>
          <Link to="/my/payment" className="type-caption font-semibold text-brand-royal">
            관리 · Manage
          </Link>
        </div>

        {(() => {
          const stampedToday = hasStampedToday(store.id);
          return (
            <div className="grid grid-cols-1 gap-g3">
              <AppButton variant="secondary" className="w-full" onClick={() => navigate(`/vendor/${store.id}/menu`)}>
                {primary("메뉴 전체", "Full menu")}
              </AppButton>
              <AppButton
                variant="tertiary"
                className="w-full"
                disabled={stampedToday}
                onClick={() => addStamp(store.id)}
              >
                {stampedToday ? <Check className="h-5 w-5" /> : <StampIcon className="h-5 w-5" />}
                {stampedToday
                  ? `오늘 적립 완료 · Stamped today (${count}/${total})`
                  : `방문 체크인 · Check in (+1 stamp)`}
              </AppButton>
            </div>
          );
        })()}

        <div className="rounded-card border border-border bg-card p-g4 shadow-elevate-sm space-y-g3">
          {isQueued ? (
            <>
              <div className="text-center space-y-g2">
                <Ticket className="h-8 w-8 mx-auto text-brand-royal" />
                <p className="type-title text-brand-royal tabular-nums">#{queueNumber}</p>
                <p className="type-caption text-muted-foreground">
                  {peopleAhead <= 1
                    ? "곧 차례에요! · You're almost up"
                    : `${peopleAhead}명 앞 · ${peopleAhead} ahead`}
                </p>
              </div>
              <AppButton variant="tertiary" className="w-full" onClick={() => leaveQueue(store.id)}>
                대기 취소 · Cancel
              </AppButton>
            </>
          ) : user ? (
            <AppButton variant="primary" className="w-full" onClick={handleQueue}>
              줄서기 · Join queue ({store.queueCount}명 대기 · {store.queueCount} waiting)
            </AppButton>
          ) : (
            <p className="type-caption text-center text-muted-foreground py-g2">
              로그인 후 줄서기 기능을 이용해보세요
            </p>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}
