import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "@/components/ui/sonner";
import { stores } from "@/data/stores";

export interface QueueTicket {
  vendorId: string;
  queueNumber: number;
  peopleAhead: number;
  /** Snapshot of `peopleAhead` at the moment the ticket was joined.
   *  Used to render a monotonic progress bar. Never mutated after creation. */
  initialPeopleAhead: number;
  etaMinutes: number;
  initialEtaMinutes: number;
  joinedAt: number;
  notified?: boolean;
  /** 알림 1회 발송 후 true (예상 ~5분 이내) */
  notified5Min?: boolean;
  /** 알림 1회 발송 후 true (입장 차례: 대기 0·예상 0) */
  notified0Min?: boolean;
}

export type QueueInAppNotification = {
  id: string;
  vendorId: string;
  kind: "five_min" | "turn";
  ko: string;
  en: string;
  createdAt: number;
};

interface QueueContextValue {
  tickets: QueueTicket[];
  ticketFor: (vendorId: string) => QueueTicket | undefined;
  joinQueue: (vendorId: string, opts: { queueNumber: number; peopleAhead: number; etaMinutes: number }) => QueueTicket;
  leaveQueue: (vendorId: string) => void;
  /** 웨이팅 알림(5분 전·입장) 미확인 — 종 아이콘 빨간 점 */
  queueBellDot: boolean;
  acknowledgeQueueBell: () => void;
  queueInbox: QueueInAppNotification[];
  dismissQueueNotification: (id: string) => void;
  clearQueueInbox: () => void;
}

const STORAGE_KEY = "jemulpo.queue.tickets.v1";

const QueueContext = createContext<QueueContextValue | undefined>(undefined);

function loadTickets(): QueueTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t.vendorId === "string")
      .map((t) => ({
        ...t,
        // Backfill for tickets stored before initialPeopleAhead existed.
        initialPeopleAhead:
          typeof t.initialPeopleAhead === "number" ? t.initialPeopleAhead : t.peopleAhead,
        initialEtaMinutes:
          typeof t.initialEtaMinutes === "number" ? t.initialEtaMinutes : t.etaMinutes,
        notified5Min: typeof t.notified5Min === "boolean" ? t.notified5Min : false,
        notified0Min: typeof t.notified0Min === "boolean" ? t.notified0Min : false,
      })) as QueueTicket[];
  } catch {
    return [];
  }
}

function tryBrowserNotify(title: string, body: string) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch {
    /* ignore */
  }
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<QueueTicket[]>(() => loadTickets());
  const [queueBellDot, setQueueBellDot] = useState(false);
  const [queueInbox, setQueueInbox] = useState<QueueInAppNotification[]>([]);
  const lastTickRef = useRef<number>(Date.now());

  const acknowledgeQueueBell = useCallback(() => setQueueBellDot(false), []);

  const dismissQueueNotification = useCallback((id: string) => {
    setQueueInbox((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearQueueInbox = useCallback(() => setQueueInbox([]), []);

  /** 예상 5분 이내·입장 차례: 티켓 플래그, 인박스, 상단 토스트, 종 점 */
  useEffect(() => {
    const additions: QueueInAppNotification[] = [];

    for (const t of tickets) {
      const store = stores.find((s) => s.id === t.vendorId);
      if (!store) continue;

      if (!t.notified5Min && t.etaMinutes > 0 && t.etaMinutes <= 5) {
        const id = `q5-${t.vendorId}-${t.etaMinutes}-${Math.floor(t.joinedAt)}`;
        additions.push({
          id,
          vendorId: t.vendorId,
          kind: "five_min",
          ko: `${store.name} 입장까지 약 ${t.etaMinutes}분 남았어요!`,
          en: `About ${t.etaMinutes} min until your turn at ${store.nameEn}.`,
          createdAt: Date.now(),
        });
      }
      if (!t.notified0Min && t.etaMinutes === 0 && t.peopleAhead === 0) {
        const id = `q0-${t.vendorId}-${Math.floor(t.joinedAt)}`;
        additions.push({
          id,
          vendorId: t.vendorId,
          kind: "turn",
          ko: `${store.name}, 지금 입장 차례예요!`,
          en: `${store.nameEn}: your table is ready!`,
          createdAt: Date.now(),
        });
      }
    }

    if (additions.length === 0) return;

    setTickets((prev) => {
      let changed = false;
      const next = prev.map((t) => {
        if (!t.notified5Min && t.etaMinutes > 0 && t.etaMinutes <= 5) {
          changed = true;
          return { ...t, notified5Min: true };
        }
        if (!t.notified0Min && t.etaMinutes === 0 && t.peopleAhead === 0) {
          changed = true;
          return { ...t, notified0Min: true };
        }
        return t;
      });
      return changed ? next : prev;
    });

    setQueueInbox((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const merged = [...additions.filter((a) => !seen.has(a.id)), ...prev];
      return merged.slice(0, 50);
    });
    setQueueBellDot(true);

    for (const m of additions) {
      tryBrowserNotify(m.ko, m.en);
      toast(m.ko, {
        description: m.en,
        duration: 1500,
        position: "top-center",
        id: m.id,
        classNames: {
          toast: "text-left w-[min(100vw-2rem,24rem)]",
        },
      });
    }
  }, [tickets]);

  // Persist
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      /* ignore */
    }
  }, [tickets]);

  // Recompute queue by wall-clock time (minute based) + 입장 차례(0분·앞 0명) 10분 이상이면 자동 제거
  useEffect(() => {
    const STALE_TURN_MINUTES = 10;
    const id = window.setInterval(() => {
      const now = Date.now();
      lastTickRef.current = now;
      setTickets((prev) => {
        if (prev.length === 0) return prev;
        const withProgress = prev.map((t) => {
          const elapsedMinutes = Math.floor((now - t.joinedAt) / 60000);
          const newEta = Math.max(0, t.initialEtaMinutes - elapsedMinutes);
          const progressRatio =
            t.initialEtaMinutes > 0 ? 1 - newEta / t.initialEtaMinutes : 1;
          const newAhead = Math.max(0, Math.ceil(t.initialPeopleAhead * (1 - progressRatio)));
          if (newAhead !== t.peopleAhead || newEta !== t.etaMinutes) {
            return { ...t, peopleAhead: newAhead, etaMinutes: newEta };
          }
          return t;
        });

        const withoutStale = withProgress.filter((t) => {
          if (t.etaMinutes !== 0 || t.peopleAhead !== 0) return true;
          const elapsedMinutes = Math.floor((now - t.joinedAt) / 60000);
          const minutesSinceEtaHitZero =
            t.initialEtaMinutes > 0
              ? Math.max(0, elapsedMinutes - t.initialEtaMinutes)
              : elapsedMinutes;
          return minutesSinceEtaHitZero < STALE_TURN_MINUTES;
        });

        if (withoutStale.length !== withProgress.length) {
          return withoutStale;
        }
        const mapChanged = withProgress.some(
          (t, i) => t.etaMinutes !== prev[i]!.etaMinutes || t.peopleAhead !== prev[i]!.peopleAhead,
        );
        return mapChanged ? withProgress : prev;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const ticketFor = useCallback(
    (vendorId: string) => tickets.find((t) => t.vendorId === vendorId),
    [tickets],
  );

  const joinQueue = useCallback<QueueContextValue["joinQueue"]>((vendorId, opts) => {
    const ticket: QueueTicket = {
      vendorId,
      queueNumber: opts.queueNumber,
      peopleAhead: opts.peopleAhead,
      initialPeopleAhead: opts.peopleAhead,
      etaMinutes: opts.etaMinutes,
      initialEtaMinutes: opts.etaMinutes,
      joinedAt: Date.now(),
      notified: opts.peopleAhead <= 1,
      notified5Min: false,
      notified0Min: false,
    };
    setTickets((prev) => {
      const without = prev.filter((t) => t.vendorId !== vendorId);
      return [...without, ticket];
    });
    return ticket;
  }, []);

  const leaveQueue = useCallback((vendorId: string) => {
    setTickets((prev) => prev.filter((t) => t.vendorId !== vendorId));
  }, []);

  return (
    <QueueContext.Provider
      value={{
        tickets,
        ticketFor,
        joinQueue,
        leaveQueue,
        queueBellDot,
        acknowledgeQueueBell,
        queueInbox,
        dismissQueueNotification,
        clearQueueInbox,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueue must be used within QueueProvider");
  return ctx;
}
