export const JEMULPO_AUTH_CHANGE = "jemulpo-auth-changed";

export function notifyUserStorageScopeChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(JEMULPO_AUTH_CHANGE));
}
