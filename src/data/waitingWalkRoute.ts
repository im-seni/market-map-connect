import { haversineMeters } from "@/lib/haversine";
import {
  INCHON_FISH_MARKET,
  PALMIDO_CRUISE_ANCHOR,
  roadCenterFromAnchors,
  eventPlazaFallbackFromRoad,
} from "@/data/yeonanMapAnchors";

/** 제물포·연안부두 일대 산책 코스 (지도·연출용) */
export interface WalkStop {
  order: number;
  titleKo: string;
  titleEn: string;
  /** 한줄 설명 */
  blurbKo: string;
  blurbEn: string;
  lat: number;
  lng: number;
}

/** 3번: 지도 탭과 동일하게 `Places.keywordSearch`로 덮어쓸 때까지 폴백 좌표 */
const ST_PETERSBURG_SQUARE_FALLBACK = eventPlazaFallbackFromRoad(
  INCHON_FISH_MARKET,
  roadCenterFromAnchors(),
);

export const WAITING_WALK_STOPS: WalkStop[] = [
  {
    order: 1,
    titleKo: "인천 종합 어시장",
    titleEn: "Incheon Fish Market Complex",
    blurbKo: "인천 종합 어시장에서 싱싱한 활어회를 비롯한 인기 메뉴를 둘러보세요.",
    blurbEn: "Explore popular dishes including fresh sashimi and seafood at the market.",
    lat: INCHON_FISH_MARKET.lat,
    lng: INCHON_FISH_MARKET.lng,
  },
  {
    order: 2,
    titleKo: "팔미도 유람선",
    titleEn: "Palmido Cruise",
    blurbKo: "선착장 근처 해양공원에서 바다 경치를 즐겨보세요.",
    blurbEn: "Enjoy the sea view at the marine park near the cruise wharf.",
    lat: PALMIDO_CRUISE_ANCHOR.lat,
    lng: PALMIDO_CRUISE_ANCHOR.lng,
  },
  {
    order: 3,
    titleKo: "상트페테르부르크광장",
    titleEn: "St. Petersburg Square",
    blurbKo:
      "역사적 가치가 있는 상트페테르부르크 광장을 둘러보고, 광장에서 진행되는 이벤트에 참여해 보세요.",
    blurbEn:
      "Walk through St. Petersburg Square and join plaza events when they are held.",
    lat: ST_PETERSBURG_SQUARE_FALLBACK.lat,
    lng: ST_PETERSBURG_SQUARE_FALLBACK.lng,
  },
];

const WALK_SPEED_M_PER_MIN = 75; // ≈ 4.5 km/h

export interface WalkSegment {
  from: WalkStop;
  to: WalkStop;
  distanceM: number;
  walkMinutes: number;
}

export function getWalkSegmentsForStops(stops: WalkStop[]): WalkSegment[] {
  const segs: WalkSegment[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i]!;
    const to = stops[i + 1]!;
    const distanceM = haversineMeters(
      { lat: from.lat, lng: from.lng },
      { lat: to.lat, lng: to.lng },
    );
    const walkMinutes = Math.max(1, Math.round(distanceM / WALK_SPEED_M_PER_MIN));
    segs.push({ from, to, distanceM, walkMinutes });
  }
  return segs;
}

export function getWalkSegments(): WalkSegment[] {
  return getWalkSegmentsForStops(WAITING_WALK_STOPS);
}
