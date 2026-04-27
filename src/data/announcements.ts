export type AnnouncementUrgency = "info" | "urgent";

export interface Announcement {
  id: string;
  titleKo: string;
  titleEn: string;
  bodyKo: string;
  bodyEn: string;
  dateLabelKo: string;
  dateLabelEn: string;
  timeRangeKo: string;
  timeRangeEn: string;
  urgency: AnnouncementUrgency;
  /**
   * Optional in-app route the "자세히 보기 · View details" CTA links to.
   * Omit to hide the CTA on this announcement.
   */
  ctaHref?: string;
}

export const announcements: Announcement[] = [
  {
    id: "a1",
    titleKo: "오늘 밤 특별 공연",
    titleEn: "Tonight’s special stage",
    bodyKo: "메인 스테이지에서 20:00 라이브 밴드 공연이 있습니다.",
    bodyEn: "Live band at the main stage at 8:00 PM.",
    dateLabelKo: "4월 29일",
    dateLabelEn: "Apr 29",
    timeRangeKo: "20:00–21:30",
    timeRangeEn: "8:00–9:30 PM",
    urgency: "info",
    ctaHref: "/map",
  },
  {
    id: "a2",
    titleKo: "일부 구역 임시 통제",
    titleEn: "Temporary zone closure",
    bodyKo: "불꽃 준비 구역 인근은 안전을 위해 19:30부터 통제됩니다.",
    bodyEn: "Area near the fireworks prep zone closes from 7:30 PM for safety.",
    dateLabelKo: "오늘",
    dateLabelEn: "Today",
    timeRangeKo: "19:30–22:00",
    timeRangeEn: "7:30–10:00 PM",
    urgency: "urgent",
    ctaHref: "/map",
  },
  {
    id: "a3",
    titleKo: "우천 시 노천 좌석 운영 변경",
    titleEn: "Outdoor seating if rain",
    bodyKo: "비 예보 시 일부 노천 좌석이 제한될 수 있습니다.",
    bodyEn: "Some outdoor seating may be limited if rain is forecast.",
    dateLabelKo: "행사 기간",
    dateLabelEn: "Event dates",
    timeRangeKo: "전일",
    timeRangeEn: "All day",
    urgency: "info",
  },
];

/**
 * Sort key for an announcement.
 *
 * Strategy:
 *  1. Urgent items always come first (within urgency, fall through to date/time).
 *  2. Parse `dateLabelEn` to a concrete day:
 *     - "Today" / "오늘"        → today
 *     - "Tomorrow" / "내일"     → today + 1
 *     - "Apr 29", "May 1", etc. → that date in the current year (rolling: if the
 *       date has already passed this year by >180 days, treat as next year so a
 *       Jan announcement viewed in December still sorts forward).
 *     - Anything else (e.g. "Event dates", "행사 기간") → +Infinity, pushed to
 *       the bottom of the list.
 *  3. Within the same day, parse the *start* of `timeRangeEn` ("8:00 PM",
 *     "7:30–10:00 PM", "All day") to minutes since midnight. "All day" /
 *     "전일" → +Infinity, sorted after timed items.
 */

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDateLabel(label: string, now: Date): number {
  const l = label.trim().toLowerCase();
  const today = startOfDay(now);
  if (l === "today" || l === "오늘") return today.getTime();
  if (l === "tomorrow" || l === "내일") {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return t.getTime();
  }
  // "Apr 29", "May 1"
  const m = l.match(/^([a-z]+)\s+(\d{1,2})$/);
  if (m) {
    const month = MONTHS[m[1]];
    const day = parseInt(m[2], 10);
    if (month !== undefined && day >= 1 && day <= 31) {
      let candidate = new Date(now.getFullYear(), month, day);
      // If date is more than 180 days behind today, roll to next year.
      const diffDays = (candidate.getTime() - today.getTime()) / 86_400_000;
      if (diffDays < -180) candidate = new Date(now.getFullYear() + 1, month, day);
      return candidate.getTime();
    }
  }
  return Number.POSITIVE_INFINITY;
}

function parseStartMinutes(range: string): number {
  const r = range.trim().toLowerCase();
  if (!r || r === "all day" || r === "전일") return Number.POSITIVE_INFINITY;
  // First time token: "8:00", "8:00 PM", "19:30"
  const m = r.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!m) return Number.POSITIVE_INFINITY;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = m[3];
  if (ampm === "pm" && h < 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  return h * 60 + min;
}

/**
 * Returns announcements sorted: urgent first, then by parsed date asc, then by
 * parsed start time asc, with original order as a final stable tiebreaker.
 */
export function sortedAnnouncements(
  list: Announcement[] = announcements,
  now: Date = new Date(),
): Announcement[] {
  return list
    .map((a, i) => ({
      a,
      i,
      urgent: a.urgency === "urgent" ? 0 : 1,
      day: parseDateLabel(a.dateLabelEn, now),
      time: parseStartMinutes(a.timeRangeEn),
    }))
    .sort(
      (x, y) =>
        x.urgent - y.urgent ||
        x.day - y.day ||
        x.time - y.time ||
        x.i - y.i,
    )
    .map((x) => x.a);
}

