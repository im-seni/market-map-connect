import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NightMarketMap from "@/components/NightMarketMap";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { FilterChip } from "@/components/app/FilterChip";
import { AppBottomSheet } from "@/components/app/AppBottomSheet";
import { AppButton } from "@/components/app/AppButton";
import { CrowdChip, VendorStatusChip } from "@/components/app/StatusChip";
import type { Store } from "@/data/stores";
import { stores, inferCrowdLevel, getVendorStatus } from "@/data/stores";

const categories = [
  { id: "all", ko: "전체", en: "All" },
  { id: "food", ko: "먹거리", en: "Food" },
  { id: "drink", ko: "음료", en: "Drinks" },
  { id: "dessert", ko: "디저트", en: "Dessert" },
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
  const [cat, setCat] = useState<(typeof categories)[number]["id"]>("all");
  const [sheetStore, setSheetStore] = useState<Store | null>(null);

  const filtered = useMemo(() => {
    if (cat === "all") return stores;
    if (cat === "drink") return stores.filter((s) => s.category === "음료");
    if (cat === "dessert") return stores.filter((s) => s.category === "디저트");
    return stores.filter((s) => s.category !== "음료"); // rough "food"
  }, [cat]);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />
      <div className="px-g4 pb-g2 flex gap-g2 overflow-x-auto no-scrollbar border-b border-border touch-pan-x">
        {categories.map((c) => (
          <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.ko} · {c.en}
          </FilterChip>
        ))}
      </div>
      <div className="flex-1 px-g4 py-g4 overflow-y-auto space-y-g3">
        <p className="type-caption text-muted-foreground text-center">
          항구 일러스트 맵 · Illustrated harbor map · 핀 탭하여 미리보기
        </p>
        <NightMarketMap stores={filtered} onStoreClick={setSheetStore} />
      </div>

      <AppBottomSheet
        open={!!sheetStore}
        onClose={() => setSheetStore(null)}
        title={
          sheetStore ? (
            <span className="flex items-center gap-g2">
              <span className="text-xl">{sheetStore.emoji}</span>
              <span>
                {sheetStore.name} · {sheetStore.nameEn}
              </span>
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
            <p className="type-body text-muted-foreground">
              대기 {sheetStore.waitTime}분 · Wait {sheetStore.waitTime}m · 대기줄 {sheetStore.queueCount}명 ·{" "}
              {sheetStore.queueCount} in line
            </p>
            <p className="type-caption line-clamp-3">{sheetStore.description}</p>
            <div className="space-y-g2">
              <p className="type-caption font-semibold text-foreground">짧은 메뉴 · Short menu</p>
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
              상세 보기 · Vendor detail
            </AppButton>
          </div>
        )}
      </AppBottomSheet>
    </div>
  );
}
