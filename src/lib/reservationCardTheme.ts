/** Remaining wait: lower ETA / fewer ahead → hotter accent (closer to reference “거의 도착”). */
export type ReservationUrgency = "critical" | "urgent" | "soon" | "calm";

export function reservationUrgency(etaMinutes: number, peopleAhead: number): ReservationUrgency {
  if (peopleAhead === 0 || etaMinutes <= 2) return "critical";
  if (etaMinutes <= 8) return "urgent";
  if (etaMinutes <= 20) return "soon";
  return "calm";
}

export type ReservationTheme = {
  ringClass: string;
  accentBarClass: string;
  badgeClass: string;
  numberClass: string;
};

export function reservationTheme(u: ReservationUrgency): ReservationTheme {
  switch (u) {
    case "critical":
      return {
        ringClass: "border-red-500",
        accentBarClass: "bg-red-500",
        badgeClass: "bg-red-500 text-white",
        numberClass: "text-red-600",
      };
    case "urgent":
      return {
        ringClass: "border-orange-500",
        accentBarClass: "bg-orange-500",
        badgeClass: "bg-orange-500 text-white",
        numberClass: "text-orange-600",
      };
    case "soon":
      return {
        ringClass: "border-amber-400",
        accentBarClass: "bg-amber-400",
        badgeClass: "bg-amber-500 text-white",
        numberClass: "text-amber-700",
      };
    default:
      return {
        ringClass: "border-emerald-500/70",
        accentBarClass: "bg-emerald-500",
        badgeClass: "bg-emerald-600 text-white",
        numberClass: "text-emerald-700",
      };
  }
}
