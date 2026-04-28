import { useMemo } from "react";
import { Link } from "react-router-dom";
import { StackHeader } from "@/components/app/StackHeader";
import { useRewards } from "@/contexts/RewardsContext";
import { storeById } from "@/data/stores";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const MAP_DETAIL_STATE = (storeId: string) =>
  ({
    waitingDetailStoreId: storeId,
    fromWaiting: false,
    returnTo: "/my/history",
  }) as const;

export default function VisitHistoryScreen() {
  const { primary, locale } = useLanguage();
  const rewards = useRewards();
  const visitLog = rewards.visitLog ?? [];

  const rows = useMemo(
    () => [...visitLog].sort((a, b) => b.collectedAt - a.collectedAt),
    [visitLog],
  );

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full bg-background">
      <StackHeader title={primary("방문 기록", "Visit history")} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-g4 py-g4">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-g12 text-center px-g2">
            <p className="type-body text-muted-foreground text-pretty">
              {primary(
                "스탬프를 적립한 가게가 여기에 쌓여요. 리워드에서 QR로 체크인해 보세요.",
                "Stores where you earned a stamp appear here. Check in with QR from Rewards.",
              )}
            </p>
          </div>
        ) : (
          <ul className="space-y-g2">
            {rows.map((e, idx) => {
              const s = storeById(e.vendorId);
              const name = s
                ? primary(s.name, s.nameEn)
                : primary("가맹점", "Vendor");
              const dateStr =
                locale === "ko"
                  ? `${e.collectedOn.replace(/-/g, ".")}`
                  : e.collectedOn;
              return (
                <li key={`${e.vendorId}-${e.collectedAt}-${idx}`}>
                  <Link
                    to="/map"
                    state={MAP_DETAIL_STATE(e.vendorId)}
                    className={cn(
                      "flex items-center gap-g3 rounded-card border border-border bg-card p-g4 shadow-elevate-sm",
                      "hover:bg-secondary/50 transition-colors min-h-[72px]",
                    )}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                      {s?.emoji ?? "📍"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="type-body font-semibold text-foreground truncate">{name}</p>
                      <p className="type-caption text-muted-foreground mt-g1 tabular-nums">
                        {primary("스탬프 · ", "Stamp · ")}
                        {dateStr}
                      </p>
                    </div>
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
