import type { Store } from "@/data/stores";

export type WaitListFilter = "all" | "u10" | "u20";
export type RatingListFilter = "all" | "r35" | "r40" | "r45";

export function storeMatchesListFilters(
  s: Store,
  f: { wait: WaitListFilter; rating: RatingListFilter }
): boolean {
  if (f.rating === "r35" && s.rating < 3.5) return false;
  if (f.rating === "r40" && s.rating < 4) return false;
  if (f.rating === "r45" && s.rating < 4.5) return false;
  if (f.wait === "u10" && s.waitTime >= 10) return false;
  if (f.wait === "u20" && s.waitTime >= 20) return false;
  return true;
}
