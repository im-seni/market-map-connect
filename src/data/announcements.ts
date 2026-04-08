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
}

export const announcements: Announcement[] = [
  {
    id: "a1",
    titleKo: "오늘 밤 특별 공연",
    titleEn: "Tonight’s special stage",
    bodyKo: "메인 스테이지에서 20:00 라이브 밴드 공연이 있습니다.",
    bodyEn: "Live band at the main stage at 8:00 PM.",
    dateLabelKo: "4월 8일",
    dateLabelEn: "Apr 8",
    timeRangeKo: "20:00–21:30",
    timeRangeEn: "8:00–9:30 PM",
    urgency: "info",
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
