/** @ 뒤에 `example.com` 형태(도메인.최상위도메인)인지 검사 */
export function isValidEmailFormat(value: string): boolean {
  const t = value.trim();
  if (!t || !t.includes("@")) return false;
  const at = t.indexOf("@");
  if (at <= 0) return false;
  const local = t.slice(0, at);
  const domain = t.slice(at + 1);
  if (!local || !domain) return false;
  if (!domain.includes(".")) return false;
  const parts = domain.split(".");
  if (parts.length < 2) return false;
  const tld = parts[parts.length - 1] ?? "";
  if (tld.length < 2) return false;
  for (const p of parts) {
    if (!p) return false;
  }
  return true;
}
