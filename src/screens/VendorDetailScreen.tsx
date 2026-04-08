import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Clock, CreditCard, Star, Users, Ticket, ScanLine } from "lucide-react";
import { StackHeader } from "@/components/app/StackHeader";
import { PhoneFrame } from "@/components/app/PhoneFrame";
import { AppButton } from "@/components/app/AppButton";
import { FilterChip } from "@/components/app/FilterChip";
import { CrowdChip, VendorStatusChip } from "@/components/app/StatusChip";
import { storeById, inferCrowdLevel, getVendorStatus } from "@/data/stores";
import NotFound from "@/pages/NotFound";

const crowdLabels = {
  low: { ko: "여유", en: "Low" },
  moderate: { ko: "보통", en: "Moderate" },
  busy: { ko: "혼잡", en: "Busy" },
} as const;

const vendorLabels = {
  open: { ko: "영업 중", en: "Open" },
  sold_out: { ko: "품절", en: "Sold Out" },
  closing_soon: { ko: "마감 임박", en: "Closing Soon" },
} as const;

export default function VendorDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = id ? storeById(id) : undefined;

  const [isQueued, setIsQueued] = useState(false);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [localQueue, setLocalQueue] = useState(store?.queueCount ?? 0);

  if (!store) return <NotFound />;

  const crowd = inferCrowdLevel(store);
  const status = getVendorStatus(store);
  const c = crowdLabels[crowd];
  const v = vendorLabels[status];

  const handleQueue = () => {
    if (!isQueued) {
      const n = localQueue + 1;
      setQueueNumber(n);
      setLocalQueue(n);
      setIsQueued(true);
    }
  };

  return (
    <PhoneFrame className="min-h-dvh">
      <StackHeader title={`${store.emoji} ${store.name}`} />
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
            <Clock className="h-5 w-5 text-brand-royal shrink-0" />
            <div>
              <p className="type-caption text-muted-foreground">예상 대기 · Est. wait</p>
              <p className="type-body font-semibold">
                {store.waitTime}분 · {store.waitTime}m
              </p>
            </div>
          </div>
          <div className="rounded-card border border-border bg-secondary p-g3 flex gap-g2 items-center shadow-elevate-sm">
            <Users className="h-5 w-5 text-brand-coral shrink-0" />
            <div>
              <p className="type-caption text-muted-foreground">대기 중 · In line</p>
              <p className="type-body font-semibold">{localQueue}명 · {localQueue}</p>
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

        <div className="grid grid-cols-1 gap-g3">
          <AppButton variant="secondary" className="w-full" onClick={() => navigate(`/vendor/${store.id}/menu`)}>
            메뉴 전체 · Full menu
          </AppButton>
          <AppButton
            variant="tertiary"
            className="w-full"
            onClick={() => navigate("/rewards")}
          >
            <ScanLine className="h-5 w-5" />
            스탬프 적립 · Collect stamp
          </AppButton>
        </div>

        <div className="rounded-card border border-border bg-card p-g4 shadow-elevate-sm space-y-g3">
          {isQueued ? (
            <>
              <div className="text-center space-y-g2">
                <Ticket className="h-8 w-8 mx-auto text-brand-royal" />
                <p className="type-title text-brand-royal">#{queueNumber}</p>
                <p className="type-caption text-muted-foreground">대기번호 발급 · Queue issued</p>
              </div>
              <AppButton variant="tertiary" className="w-full" onClick={() => { setIsQueued(false); setQueueNumber(null); setLocalQueue((q) => q - 1); }}>
                대기 취소 · Cancel
              </AppButton>
            </>
          ) : (
            <AppButton variant="primary" className="w-full" onClick={handleQueue}>
              줄서기 · Join queue ({localQueue}명 대기 · {localQueue} waiting)
            </AppButton>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}
