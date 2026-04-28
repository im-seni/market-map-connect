import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Coupon, CouponState } from "@/data/coupons";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface CouponsContextValue {
  coupons: Coupon[];
  couponsLoading: boolean;
  couponsError: string | null;
  couponById: (id: string) => Coupon | undefined;
  refreshCoupons: () => Promise<void>;
}

const CouponsContext = createContext<CouponsContextValue | undefined>(undefined);

function normalizeDateOnly(isoOrDate: string): string {
  if (isoOrDate.length >= 10) return isoOrDate.slice(0, 10);
  return isoOrDate;
}

function coerceState(raw: string): CouponState {
  return raw === "used" || raw === "expired" || raw === "active" ? raw : "active";
}

/** Supabase `coupons` select row → 앱 `Coupon` (상세 직링크 등에서 재사용) */
export function couponFromSupabaseRow(row: {
  id: string;
  title_ko: string;
  title_en: string;
  vendor_id: string;
  expires_at: string;
  state: string;
}): Coupon {
  return {
    id: row.id,
    titleKo: row.title_ko,
    titleEn: row.title_en,
    vendorId: row.vendor_id,
    expiresAt: normalizeDateOnly(row.expires_at),
    state: coerceState(row.state),
  };
}

export function CouponsProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    if (!user) {
      setCoupons([]);
      setCouponsLoading(false);
      setCouponsError(null);
      return;
    }
    const uid = user.id;
    setCouponsLoading(true);
    setCouponsError(null);
    const { data, error } = await supabase
      .from("coupons")
      .select("id, title_ko, title_en, vendor_id, expires_at, state")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[coupons] fetch:", error.message, error.code);
      setCouponsError(error.message);
      setCoupons([]);
    } else {
      setCoupons((data ?? []).map(couponFromSupabaseRow));
    }
    setCouponsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void fetchCoupons();
  }, [fetchCoupons]);

  const couponById = useCallback((id: string) => coupons.find((c) => c.id === id), [coupons]);

  return (
    <CouponsContext.Provider
      value={{
        coupons,
        couponsLoading,
        couponsError,
        couponById,
        refreshCoupons: fetchCoupons,
      }}
    >
      {children}
    </CouponsContext.Provider>
  );
}

export function useCoupons() {
  const ctx = useContext(CouponsContext);
  if (!ctx) throw new Error("useCoupons must be used within CouponsProvider");
  return ctx;
}
