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
    id: "c-yacht-50",
    titleKo: "미니 요트 50% 할인권",
    titleEn: "Mini yacht 50% off",
    vendorId: "15",
    expiresAt: "2026-08-31",
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
 * Formats meta line for list / detail.
 * KO active: "D-64  ·  2026-06-30 까지"
 * KO used (past expiry): "만료  ·  2026-03-01 까지" — 카드 하단에 "사용 완료" 병행
 * KO expired: "만료  ·  YYYY-MM-DD 까지"
 */
export function formatCouponMeta(
  expiresAt: string,
  locale: Locale = "ko",
  now: Date = new Date(),
  state?: CouponState,
): string {
  if (!expiresAt) return "";
  const d = daysUntil(expiresAt, now);

  if (state === "expired") {
    return locale === "en"
      ? `Expired  ·  Until ${expiresAt}`
      : `만료  ·  ${expiresAt} 까지`;
  }

  if (state === "used") {
    if (locale === "en") {
      if (d > 0) return `D-${d}  ·  Until ${expiresAt}`;
      if (d === 0) return `D-day  ·  Until ${expiresAt}`;
      return `Expired  ·  Until ${expiresAt}`;
    }
    if (d > 0) return `D-${d}  ·  ${expiresAt} 까지`;
    if (d === 0) return `D-day  ·  ${expiresAt} 까지`;
    return `만료  ·  ${expiresAt} 까지`;
  }

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
