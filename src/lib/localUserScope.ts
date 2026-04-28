import { getDemoSession } from "@/lib/demoAuthStorage";

const GUEST_DEVICE_ID_KEY = "jemulpo.deviceGuestId.v1";

/**
 * 로컬에서 stamps / 쿠폰 등을 구분하는 키 접미사.
 * - 로그인: `user:` + 정규화된 이메일
 * - 비로그인: `guest:` + 이 기기에 고정된 익명 id
 */
export function getUserStorageScope(): string {
  if (typeof window === "undefined") return "guest:ssr";
  const s = getDemoSession();
  if (s?.email) {
    return `user:${s.email.trim().toLowerCase()}`;
  }
  let id = localStorage.getItem(GUEST_DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `g${Date.now()}`;
    try {
      localStorage.setItem(GUEST_DEVICE_ID_KEY, id);
    } catch {
      id = `g${Date.now()}`;
    }
  }
  return `guest:${id}`;
}

export function scopedStorageKey(baseKey: string, scope: string): string {
  return `${baseKey}::${scope}`;
}

/**
 * 스코프별 키에서 읽고, 비어 있으면 예전 단일 키(`baseKey`)를 guest 스코프로 1회 이전.
 * 로그인 계정에는 레거시를 붙이지 않음(다른 사람 데이터 섞임 방지).
 */
export function readScopedStorageOrMigrateGuest(
  baseKey: string,
  scope: string,
): string | null {
  if (typeof window === "undefined") return null;
  const scoped = scopedStorageKey(baseKey, scope);
  const existing = localStorage.getItem(scoped);
  if (existing) return existing;
  if (!scope.startsWith("guest:")) return null;
  const legacy = localStorage.getItem(baseKey);
  if (!legacy) return null;
  try {
    localStorage.setItem(scoped, legacy);
    localStorage.removeItem(baseKey);
  } catch {
    return legacy;
  }
  return localStorage.getItem(scoped);
}
