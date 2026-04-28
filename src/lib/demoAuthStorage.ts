import { notifyUserStorageScopeChange } from "@/lib/authScopeEvents";

/**
 * 시연용 로컬 인증 (localStorage). Supabase 연동 전 데모·캡스톤 시연용 — 비밀번호 평문 저장.
 * 고정 시연 계정: capstone@yonsei.ac.kr / 12345678 / 김연세
 */
export type DemoUserRecord = {
  email: string;
  password: string;
  displayName: string;
  marketingOptIn?: boolean;
};

const USERS_KEY = "yeonan_demo_auth_users_v1";
const SESSION_KEY = "yeonan_demo_auth_session_v1";

export const SEED_DEMO_USER: DemoUserRecord = {
  email: "capstone@yonsei.ac.kr",
  password: "12345678",
  displayName: "김연세",
};

function readUsers(): DemoUserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return [];
    return p.filter(
      (u): u is DemoUserRecord =>
        u != null &&
        typeof u === "object" &&
        typeof (u as DemoUserRecord).email === "string" &&
        typeof (u as DemoUserRecord).password === "string" &&
        typeof (u as DemoUserRecord).displayName === "string",
    );
  } catch {
    return [];
  }
}

function writeUsers(users: DemoUserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** 앱 로드 시 1회 호출 — 시연 계정이 없으면 추가 */
export function seedDemoAuth(): void {
  const users = readUsers();
  const hasSeed = users.some(
    (u) => u.email.toLowerCase() === SEED_DEMO_USER.email.toLowerCase(),
  );
  if (!hasSeed) {
    users.push({ ...SEED_DEMO_USER });
    writeUsers(users);
  }
}

export function registerUser(
  user: Omit<DemoUserRecord, "marketingOptIn"> & { marketingOptIn?: boolean },
): { ok: true; user: DemoUserRecord } | { ok: false; reason: "exists" } {
  seedDemoAuth();
  const users = readUsers();
  const emailNorm = user.email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === emailNorm)) {
    return { ok: false, reason: "exists" };
  }
  const rec: DemoUserRecord = {
    email: emailNorm,
    password: user.password,
    displayName: user.displayName.trim(),
    marketingOptIn: user.marketingOptIn,
  };
  users.push(rec);
  writeUsers(users);
  return { ok: true, user: rec };
}

export function loginWithEmailPassword(email: string, password: string): DemoUserRecord | null {
  seedDemoAuth();
  const users = readUsers();
  const e = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === e && u.password === password) ?? null;
}

export function setDemoSession(user: Pick<DemoUserRecord, "email" | "displayName">): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  notifyUserStorageScopeChange();
}

export function getDemoSession(): { email: string; displayName: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as { email?: string; displayName?: string };
    if (typeof o.email === "string" && typeof o.displayName === "string") {
      return { email: o.email, displayName: o.displayName };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearDemoSession(): void {
  localStorage.removeItem(SESSION_KEY);
  notifyUserStorageScopeChange();
}

/** 로컬 사용자 목록에서 해당 이메일 계정 제거 (데모용). */
export function deleteDemoUserByEmail(email: string): void {
  const norm = email.trim().toLowerCase();
  const users = readUsers().filter((u) => u.email.toLowerCase() !== norm);
  writeUsers(users);
}
