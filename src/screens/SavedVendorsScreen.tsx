import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { useSavedStores } from "@/contexts/SavedStoresContext";
import { storeById } from "@/data/stores";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

/** 지도·다이닝 전체 화면 상세 + 뒤로가기 시 이 목록으로 복귀 */
const MAP_DETAIL_STATE = (storeId: string) =>
  ({
    waitingDetailStoreId: storeId,
    fromWaiting: false,
    returnTo: "/my/saved",
  }) as const;

export default function SavedVendorsScreen() {
  const { primary } = useLanguage();
  const { savedIds } = useSavedStores();

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      <StackHeader title={primary("저장한 상점", "Saved vendors")} />
      <div className="flex-1 overflow-y-auto px-g4 py-g4">
        {savedIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-g12 text-center px-g2">
            <p className="type-body text-muted-foreground text-pretty">
              {primary(
                "지도·다이닝에서 상점 상세를 열고 하트를 누르면 여기에 모여요.",
                "Open a store on Maps & Dining and tap the heart to save it here.",
              )}
            </p>
          </div>
        ) : (
          <ul className="space-y-g2">
            {savedIds.map((id) => {
              const s = storeById(id);
              if (!s) return null;
              return (
                <li key={id}>
                  <Link
                    to="/map"
                    state={MAP_DETAIL_STATE(id)}
                    className={cn(
                      "flex items-center gap-g3 rounded-card border border-border bg-card p-g4 shadow-elevate-sm",
                      "hover:bg-secondary/50 transition-colors min-h-[72px]",
                    )}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                      {s.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="type-body font-semibold text-foreground truncate">
                        {primary(s.name, s.nameEn)}
                      </p>
                      <p className="type-caption text-muted-foreground truncate mt-g1">
                        {primary(s.category, s.categoryEn)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
