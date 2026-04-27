import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Map as MapIcon, List as ListIcon, SlidersHorizontal } from "lucide-react";
import NightMarketMap from "@/components/NightMarketMap";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { FilterChip } from "@/components/app/FilterChip";
import { AppBottomSheet } from "@/components/app/AppBottomSheet";
import { AppButton } from "@/components/app/AppButton";
import { CrowdChip, VendorStatusChip } from "@/components/app/StatusChip";
import { VendorListItem } from "@/components/app/VendorListItem";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import type { Store } from "@/data/stores";
import { stores, inferCrowdLevel, getVendorStatus, waitTimeColorClass } from "@/data/stores";

const categories = [
  { id: "all", ko: "전체", en: "All" },
  { id: "food", ko: "먹거리", en: "Food" },
  { id: "drink", ko: "음료", en: "Drinks" },
  { id: "dessert", ko: "디저트", en: "Dessert" },
] as const;

const waitFilters = [
  { id: "any", ko: "대기 전체", en: "Any wait" },
  { id: "lt10", ko: "10분 미만", en: "< 10 min" },
  { id: "lt20", ko: "20분 미만", en: "< 20 min" },
] as const;

const statusFilters = [
  { id: "any", ko: "상태 전체", en: "Any status" },
  { id: "open", ko: "영업 중", en: "Open" },
  { id: "reward", ko: "스탬프", en: "Stamp" },
  { id: "coupon", ko: "쿠폰", en: "Coupon" },
] as const;

const sortOptions = [
  { id: "recommended", ko: "추천", en: "Recommended" },
  { id: "wait", ko: "짧은 대기", en: "Shortest wait" },
  { id: "rating", ko: "평점", en: "Highest rated" },
] as const;

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

export default function MapScreen() {
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const [searchParams] = useSearchParams();
  // Allow other screens to deep-link into the list view, e.g. /map?view=list
  const initialView = searchParams.get("view") === "list" ? "list" : "map";
  const [view, setView] = useState<"map" | "list">(initialView);
  const [cat, setCat] = useState<(typeof categories)[number]["id"]>("all");
  const [wait, setWait] = useState<(typeof waitFilters)[number]["id"]>("any");
  const [status, setStatus] = useState<(typeof statusFilters)[number]["id"]>("any");
  const [sort, setSort] = useState<(typeof sortOptions)[number]["id"]>("recommended");
  const [sheetStore, setSheetStore] = useState<Store | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Sync view when the URL changes (e.g. quick-link tapped while already on /map)
  useEffect(() => {
    const next = searchParams.get("view") === "list" ? "list" : "map";
    setView(next);
  }, [searchParams]);

  const activeFilterCount = (wait !== "any" ? 1 : 0) + (status !== "any" ? 1 : 0);

  const filtered = useMemo(() => {
    let list = stores;
    if (cat === "drink") list = list.filter((s) => s.category === "음료");
    else if (cat === "dessert") list = list.filter((s) => s.category === "디저트");
    else if (cat === "food") list = list.filter((s) => s.category !== "음료");

    if (wait === "lt10") list = list.filter((s) => s.waitTime < 10);
    else if (wait === "lt20") list = list.filter((s) => s.waitTime < 20);

    if (status === "open") list = list.filter((s) => getVendorStatus(s) === "open");
    else if (status === "reward") list = list.filter((s) => s.hasReward);
    else if (status === "coupon") list = list.filter((s) => s.hasCoupon);

    return list;
  }, [cat, wait, status]);

  const sortedList = useMemo(() => {
    const arr = [...filtered];
    if (sort === "wait") arr.sort((a, b) => a.waitTime - b.waitTime);
    else if (sort === "rating") arr.sort((a, b) => b.rating - a.rating);
    return arr;
  }, [filtered, sort]);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />
      <div className="px-g4 pt-g3 pb-g2 space-y-g2 border-b border-border">
        {/* Map / List segmented toggle */}
        <div className="flex items-center gap-g2">
          <div role="tablist" className="inline-flex rounded-pill border border-border bg-secondary p-0.5 shadow-elevate-sm">
            {([
              { id: "map" as const, ko: "지도", en: "Map", Icon: MapIcon },
              { id: "list" as const, ko: "목록", en: "List", Icon: ListIcon },
            ]).map(({ id, ko, en, Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-pill px-g3 py-g1 type-caption font-semibold transition",
                  view === id
                    ? "bg-card text-foreground shadow-elevate-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {primary(ko, en)}
              </button>
            ))}
          </div>
          {view === "list" && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="ml-auto rounded-pill border border-border bg-card px-g3 py-g1 type-caption font-semibold text-foreground shadow-elevate-sm focus:outline-none focus:ring-2 focus:ring-brand-royal/30"
              aria-label={primary("정렬", "Sort")}
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {primary(o.ko, o.en)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-g2 overflow-x-auto no-scrollbar touch-pan-x items-center">
          {categories.map((c) => (
            <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              {primary(c.ko, c.en)}
            </FilterChip>
          ))}
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            aria-label={primary("필터", "Filters")}
            className={cn(
              "relative shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-pill border transition shadow-elevate-sm",
              activeFilterCount > 0
                ? "border-brand-royal/50 bg-brand-royal/10 text-brand-royal"
                : "border-border bg-card text-foreground hover:bg-secondary",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-coral px-1 text-[10px] font-bold text-white tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
      {view === "map" ? (
        <div className="flex-1 px-g4 py-g4 overflow-y-auto space-y-g3 pb-[140px]">
          <p className="type-caption text-muted-foreground text-center">
            {primary("항구 일러스트 맵 · 핀 탭하여 미리보기", "Illustrated harbor map · tap a pin to preview")}
          </p>
          <NightMarketMap stores={filtered} onStoreClick={setSheetStore} />
        </div>
      ) : (
        <div className="flex-1 px-g4 py-g4 overflow-y-auto space-y-g2 pb-[140px]">
          <p className="type-caption text-muted-foreground">
            {primary(`${sortedList.length}개 상점`, `${sortedList.length} vendors`)}
          </p>
          {sortedList.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-card/60 p-g6 text-center">
              <p className="type-body text-muted-foreground">
                {primary("조건에 맞는 상점이 없어요", "No vendors match these filters")}
              </p>
            </div>
          ) : (
            sortedList.map((s) => (
              <VendorListItem key={s.id} store={s} onClick={() => setSheetStore(s)} />
            ))
          )}
        </div>
      )}

      <AppBottomSheet
        open={!!sheetStore}
        onClose={() => setSheetStore(null)}
        title={
          sheetStore ? (
            <span className="flex items-center gap-g2">
              <span className="text-xl">{sheetStore.emoji}</span>
              <span>{primary(sheetStore.name, sheetStore.nameEn)}</span>
            </span>
          ) : null
        }
      >
        {sheetStore && (
          <div className="space-y-g4">
            <div className="flex flex-wrap gap-g2">
              {(() => {
                const cr = inferCrowdLevel(sheetStore);
                const cl = crowdLabels[cr];
                return <CrowdChip kind={cr} labelKo={cl.ko} labelEn={cl.en} />;
              })()}
              {(() => {
                const st = getVendorStatus(sheetStore);
                const vl = vendorLabels[st];
                return <VendorStatusChip kind={st} labelKo={vl.ko} labelEn={vl.en} />;
              })()}
            </div>
            <p className="type-body text-muted-foreground tabular-nums">
              <span className={`font-semibold ${waitTimeColorClass(sheetStore.waitTime)}`}>
                {primary(`대기 ${sheetStore.waitTime}분`, `Wait ${sheetStore.waitTime}m`)}
              </span>
              {primary(` · 대기줄 ${sheetStore.queueCount}명`, ` · ${sheetStore.queueCount} in line`)}
            </p>
            <p className="type-caption line-clamp-3">
              {primary(sheetStore.description, sheetStore.descriptionEn)}
            </p>
            <div className="space-y-g2">
              <p className="type-caption font-semibold text-foreground">
                {primary("짧은 메뉴", "Short menu")}
              </p>
              {sheetStore.menu.slice(0, 3).map((m, i) => (
                <div key={i} className="flex justify-between type-body border-b border-border/60 py-g2">
                  <span>{m.name}</span>
                  <span className="font-semibold text-brand-royal">{m.price.toLocaleString()}₩</span>
                </div>
              ))}
            </div>
            <AppButton
              variant="primary"
              className="w-full"
              onClick={() => {
                const id = sheetStore.id;
                setSheetStore(null);
                navigate(`/vendor/${id}`);
              }}
            >
              {primary("상세 보기", "Vendor detail")}
            </AppButton>
          </div>
        )}
      </AppBottomSheet>

      <AppBottomSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title={primary("필터", "Filters")}
      >
        <div className="space-y-g5">
          <section className="space-y-g2">
            <p className="type-caption font-semibold uppercase text-muted-foreground">
              {primary("대기 시간", "Wait time")}
            </p>
            <div className="flex flex-wrap gap-g2">
              {waitFilters.map((w) => (
                <FilterChip key={w.id} active={wait === w.id} onClick={() => setWait(w.id)}>
                  {primary(w.ko, w.en)}
                </FilterChip>
              ))}
            </div>
          </section>

          <section className="space-y-g2">
            <p className="type-caption font-semibold uppercase text-muted-foreground">
              {primary("상태 · 혜택", "Status & perks")}
            </p>
            <div className="flex flex-wrap gap-g2">
              {statusFilters.map((st) => (
                <FilterChip key={st.id} active={status === st.id} onClick={() => setStatus(st.id)}>
                  {primary(st.ko, st.en)}
                </FilterChip>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-g3 pt-g2">
            <AppButton
              variant="tertiary"
              className="w-full"
              onClick={() => {
                setWait("any");
                setStatus("any");
              }}
            >
              {primary("초기화", "Reset")}
            </AppButton>
            <AppButton variant="primary" className="w-full" onClick={() => setFilterSheetOpen(false)}>
              {primary(
                `${sortedList.length}개 보기`,
                `Show ${sortedList.length}`,
              )}
            </AppButton>
          </div>
        </div>
      </AppBottomSheet>
    </div>
  );
}
