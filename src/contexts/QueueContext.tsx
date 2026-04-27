import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { storeById } from "@/data/stores";

export interface QueueTicket {
  vendorId: string;
  queueNumber: number;
  peopleAhead: number;
  /** Snapshot of `peopleAhead` at the moment the ticket was joined.
   *  Used to render a monotonic progress bar. Never mutated after creation. */
  initialPeopleAhead: number;
  etaMinutes: number;
  joinedAt: number;
  notified?: boolean;
}

interface QueueContextValue {
  tickets: QueueTicket[];
  ticketFor: (vendorId: string) => QueueTicket | undefined;
  joinQueue: (vendorId: string, opts: { queueNumber: number; peopleAhead: number; etaMinutes: number }) => QueueTicket;
  leaveQueue: (vendorId: string) => void;
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
      })) as QueueTicket[];
  } catch {
    return [];
  }
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<QueueTicket[]>(() => loadTickets());
  const lastTickRef = useRef<number>(Date.now());

  // Persist
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      /* ignore */
    }
  }, [tickets]);

  // Tick down peopleAhead / eta every 20s & fire almost-ready toast
  useEffect(() => {
    const id = window.setInterval(() => {
      lastTickRef.current = Date.now();
      setTickets((prev) => {
        if (prev.length === 0) return prev;
        let changed = false;
        const next = prev.map((t) => {
          const newAhead = Math.max(0, t.peopleAhead - 1);
          const newEta = Math.max(0, t.etaMinutes - 2);
          if (newAhead !== t.peopleAhead || newEta !== t.etaMinutes) {
            changed = true;
            return { ...t, peopleAhead: newAhead, etaMinutes: newEta };
          }
          return t;
        });

        // fire one-shot toasts for newly almost-ready tickets
        next.forEach((t, i) => {
          if (!t.notified && t.peopleAhead <= 1) {
            const store = storeById(t.vendorId);
            const name = store ? `${store.emoji} ${store.name}` : t.vendorId;
            toast(`곧 차례에요! · You're almost up`, {
              description: `${name} · #${t.queueNumber}`,
              duration: 6000,
            });
            next[i] = { ...t, notified: true };
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }, 20000);
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
      joinedAt: Date.now(),
      notified: opts.peopleAhead <= 1,
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
    <QueueContext.Provider value={{ tickets, ticketFor, joinQueue, leaveQueue }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueue must be used within QueueProvider");
  return ctx;
}
