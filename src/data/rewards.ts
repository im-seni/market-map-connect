/**
 * Rewards: 5 QR 체크인 스탬프 → 쿠폰함에 요트 50% 쿠폰 자동 지급, 스탬프 리셋
 * (같은 가맹점·같은 날 1회)
 */

export const STAMPS_PER_CARD = 5;

export interface RewardOption {
  id: string;
  titleKo: string;
  titleEn: string;
  /** Days until expiry once claimed. */
  validDays: number;
}

export interface Stamp {
  vendorId: string;
  /** ISO date (YYYY-MM-DD) — used for the same-day-same-vendor lockout. */
  collectedOn: string;
  /** Epoch ms — preserves chronological ordering inside a single day. */
  collectedAt: number;
}

/** 방문 기록용 — 카드 초기화 후에도 유지 */
export interface VisitLogEntry {
  vendorId: string;
  collectedOn: string;
  collectedAt: number;
}

/** The 3 reward choices presented in the picker when card hits 10/10. */
export const REWARD_OPTIONS: RewardOption[] = [
  {
    id: "r-3000-off",
    titleKo: "₩3,000 할인 쿠폰",
    titleEn: "₩3,000 off coupon",
    validDays: 30,
  },
  {
    id: "r-free-drink",
    titleKo: "무료 음료 1잔",
    titleEn: "Free drink",
    validDays: 30,
  },
  {
    id: "r-free-side",
    titleKo: "무료 사이드 메뉴",
    titleEn: "Free side dish",
    validDays: 30,
  },
];

export function rewardOptionById(id: string): RewardOption | undefined {
  return REWARD_OPTIONS.find((r) => r.id === id);
}

/** YYYY-MM-DD in local time. */
export function toLocalIsoDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Future ISO date `validDays` from now, used when issuing a claimed reward coupon. */
export function expiryFromNow(validDays: number, now: Date = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + validDays);
  return toLocalIsoDate(d);
}
