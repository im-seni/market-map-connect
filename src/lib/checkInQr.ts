import { stores } from "@/data/stores";

const storeIdSet = new Set(stores.map((s) => s.id));

/**
 * QR/딥링크에서 방문 체크용 vendorId 파싱.
 * 지원 예: `jemulpo:checkin:3`, `.../checkin/3`, `3` (짧은 숫자 id)
 *
 * 시연용: QR 텍스트를 `jemulpo:checkin:demo` 로 만들면 가맹점 id `1`(왕꼬치)로 적립됩니다.
 * 그 밖의 임의 QR 문자열은 적립되지 않습니다(등록 가맹 id로 파싱될 때만).
 */
export function parseCheckInVendorId(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/jemulpo:checkin:demo/i.test(t)) return "1";
  const m1 = t.match(/jemulpo:checkin:([0-9A-Za-z]+)/i);
  if (m1?.[1] && storeIdSet.has(m1[1])) return m1[1];
  const m2 = t.match(/checkin[\/:]([0-9]+)/i);
  if (m2?.[1] && storeIdSet.has(m2[1])) return m2[1];
  if (/^\d{1,3}$/.test(t) && storeIdSet.has(t)) return t;
  return null;
}
