/**
 * 지도/다이닝 탭과 동일한 연안부두 앵커·검색어.
 * `DiningMapsScreen`의 🎬 광장 핀은 키워드 검색 성공 시 `Places` 첫 결과 좌표를 씀.
 */
export const EVENT_PLAZA_PLACES_QUERY = "상트페테르부르크 인천";

export const INCHON_FISH_MARKET = { lat: 37.4541, lng: 126.6065 } as const;
export const PALMIDO_CRUISE_ANCHOR = { lat: 37.4554620594447, lng: 126.601858565657 } as const;

export function roadCenterFromAnchors() {
  return {
    lat: (INCHON_FISH_MARKET.lat + PALMIDO_CRUISE_ANCHOR.lat) / 2,
    lng: (INCHON_FISH_MARKET.lng + PALMIDO_CRUISE_ANCHOR.lng) / 2,
  };
}

/** 키워드 검색 실패 시 `DiningMapsScreen`과 동일 공식 */
export function eventPlazaFallbackFromRoad(
  roadStart: { lat: number; lng: number },
  roadCenter: { lat: number; lng: number },
) {
  return {
    lat: (roadStart.lat + roadCenter.lat) / 2 + 0.00028,
    lng: (roadStart.lng + roadCenter.lng) / 2 + 0.00014,
  };
}
