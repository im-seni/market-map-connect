import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { useQueue } from "@/contexts/QueueContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export default function QueueAlertsScreen() {
  const navigate = useNavigate();
  const { primary, locale } = useLanguage();
  const { queueInbox, clearQueueInbox, acknowledgeQueueBell } = useQueue();

  useEffect(() => {
    acknowledgeQueueBell();
  }, [acknowledgeQueueBell]);

  const formatShortTime = (ts: number) =>
    new Date(ts).toLocaleTimeString(locale === "ko" ? "ko-KR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const openStoreLikeList = (vendorId: string) =>
    navigate("/map", { state: { waitingDetailStoreId: vendorId } });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <TopUtilityBar />

      <div className="flex shrink-0 items-center justify-between gap-g2 border-b border-border px-g4 py-g2">
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-secondary"
          aria-label={primary("뒤로", "Back")}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {queueInbox.length > 0 ? (
          <button
            type="button"
            className="type-caption font-semibold text-brand-royal"
            onClick={() => clearQueueInbox()}
          >
            {primary("모두 지우기", "Clear all")}
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-g4 py-g4">
        {queueInbox.length === 0 ? (
          <p className="type-body py-g10 text-center text-muted-foreground">
            {primary("저장된 알림이 없어요.", "No alerts yet.")}
          </p>
        ) : (
          <ul className="space-y-g3">
            {queueInbox.map((msg) => (
              <li key={msg.id}>
                <button
                  type="button"
                  onClick={() => openStoreLikeList(msg.vendorId)}
                  className={cn(
                    "w-full rounded-2xl border border-border bg-card p-g4 text-left shadow-elevate-sm transition hover:opacity-[0.97]",
                    msg.kind === "turn" && "border-brand-royal/40 bg-brand-royal/[0.04]",
                  )}
                >
                  <p className="type-body font-semibold leading-snug text-foreground">{primary(msg.ko, msg.en)}</p>
                  <p className="mt-g2 type-caption tabular-nums text-muted-foreground">{formatShortTime(msg.createdAt)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
