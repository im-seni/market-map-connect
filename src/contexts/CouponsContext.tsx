import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { coupons as seedCoupons, type Coupon } from "@/data/coupons";

interface CouponsContextValue {
  coupons: Coupon[];
  couponById: (id: string) => Coupon | undefined;
  addCoupon: (coupon: Coupon) => void;
}

const STORAGE_KEY = "jemulpo.coupons.v1";

const CouponsContext = createContext<CouponsContextValue | undefined>(undefined);

function loadCoupons(): Coupon[] {
  if (typeof window === "undefined") return seedCoupons;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedCoupons;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return seedCoupons;
    return parsed as Coupon[];
  } catch {
    return seedCoupons;
  }
}

export function CouponsProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadCoupons());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
    } catch {
      /* ignore */
    }
  }, [coupons]);

  const couponById = useCallback(
    (id: string) => coupons.find((c) => c.id === id),
    [coupons],
  );

  const addCoupon = useCallback((coupon: Coupon) => {
    setCoupons((prev) => {
      // dedupe by id
      const without = prev.filter((c) => c.id !== coupon.id);
      return [coupon, ...without];
    });
  }, []);

  return (
    <CouponsContext.Provider value={{ coupons, couponById, addCoupon }}>
      {children}
    </CouponsContext.Provider>
  );
}

export function useCoupons() {
  const ctx = useContext(CouponsContext);
  if (!ctx) throw new Error("useCoupons must be used within CouponsProvider");
  return ctx;
}
