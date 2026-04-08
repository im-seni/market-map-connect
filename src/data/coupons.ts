export type CouponState = "active" | "used" | "expired";

export interface Coupon {
  id: string;
  titleKo: string;
  titleEn: string;
  vendorId: string;
  discountKo: string;
  discountEn: string;
  expiresAt: string;
  state: CouponState;
}

export const coupons: Coupon[] = [
  {
    id: "c1",
    titleKo: "왕꼬치 2천원 할인",
    titleEn: "₩2,000 off King Skewer",
    vendorId: "1",
    discountKo: "2,000원",
    discountEn: "₩2,000",
    expiresAt: "2026-04-30",
    state: "active",
  },
  {
    id: "c2",
    titleKo: "버블티 무료 펄 업그레이드",
    titleEn: "Free pearl upgrade",
    vendorId: "3",
    discountKo: "펄 업그레이드",
    discountEn: "Pearl upgrade",
    expiresAt: "2026-04-15",
    state: "active",
  },
  {
    id: "c3",
    titleKo: "타코야끼 세트 10%",
    titleEn: "10% off takoyaki set",
    vendorId: "2",
    discountKo: "10%",
    discountEn: "10%",
    expiresAt: "2026-03-01",
    state: "used",
  },
  {
    id: "c4",
    titleKo: "야시장 웰컴 음료",
    titleEn: "Welcome drink",
    vendorId: "3",
    discountKo: "음료 1잔",
    discountEn: "1 drink",
    expiresAt: "2025-12-31",
    state: "expired",
  },
];

export function couponById(id: string): Coupon | undefined {
  return coupons.find((c) => c.id === id);
}
