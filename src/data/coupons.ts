export type CouponState = "active" | "used" | "expired";

export interface Coupon {
  id: string;
  /** Korean title shown on the card when locale = ko. */
  titleKo: string;
  /** English title shown on the card when locale = en. */
  titleEn: string;
  vendorId: string;
  /** ISO date (YYYY-MM-DD) — drives the expiry meta line in both languages. */
  expiresAt: string;
  state: CouponState;
}

export const coupons: Coupon[] = [
  {
    id: "c1",
    titleKo: "왕꼬치 ₩2,000 할인",
    titleEn: "₩2,000 off King Skewer",
    vendorId: "1",
    expiresAt: "2026-06-30",
    state: "active",
  },
  {
    id: "c2",
    titleKo: "버블티 무료 사이즈업",
    titleEn: "Free bubble tea size-up",
    vendorId: "3",
    expiresAt: "2026-06-30",
    state: "active",
  },
  {
    id: "c3",
    titleKo: "타코야끼 세트 10% 할인",
    titleEn: "10% off takoyaki set",
    vendorId: "2",
    expiresAt: "2026-03-01",
    state: "used",
  },
  {
    id: "c4",
    titleKo: "야시장 웰컴 음료 1잔",
    titleEn: "Free welcome drink",
    vendorId: "3",
    expiresAt: "2025-12-31",
    state: "expired",
  },
];

export function couponById(id: string): Coupon | undefined {
  return coupons.find((c) => c.id === id);
}

/** Days remaining until midnight of `expiresAt`. Negative when past due. */
export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const target = new Date(`${isoDate}T00:00:00`);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ms = target.getTime() - startOfToday.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export type Locale = "ko" | "en";

/**
 * Formats meta line.
 * KO: "D-64  ·  2026-06-30 까지"
 * EN: "D-64  ·  Until 2026-06-30"
 * Edge cases: D-day, expired/Expired.
 */
export function formatCouponMeta(
  expiresAt: string,
  locale: Locale = "ko",
  now: Date = new Date(),
): string {
  if (!expiresAt) return "";
  const d = daysUntil(expiresAt, now);

  if (locale === "en") {
    let dLabel: string;
    if (d > 0) dLabel = `D-${d}`;
    else if (d === 0) dLabel = "D-day";
    else dLabel = "Expired";
    return `${dLabel}  ·  Until ${expiresAt}`;
  }

  let dLabel: string;
  if (d > 0) dLabel = `D-${d}`;
  else if (d === 0) dLabel = "D-day";
  else dLabel = "만료";
  return `${dLabel}  ·  ${expiresAt} 까지`;
}
