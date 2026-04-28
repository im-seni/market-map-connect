import { useEffect, useMemo, useRef, useState } from "react";
import { StackHeader } from "@/components/app/StackHeader";
import { useLanguage } from "@/i18n/LanguageContext";
import { WAITING_WALK_STOPS, getWalkSegmentsForStops, type WalkStop } from "@/data/waitingWalkRoute";
import { EVENT_PLAZA_PLACES_QUERY } from "@/data/yeonanMapAnchors";
import { cn } from "@/lib/utils";

export default function WaitingWalkRouteScreen() {
  const { primary } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const polylineRef = useRef<{ setPath: (p: unknown) => void; setMap: (v: unknown) => void } | null>(
    null,
  );
  const overlaysRef = useRef<
    Array<{ setMap: (v: unknown) => void; setPosition?: (ll: unknown) => void }>
  >([]);

  const [mapError, setMapError] = useState<string | null>(null);
  /** 다이닝 맵 🎬과 동일: Places `상트페테르부르크 인천` 첫 결과 */
  const [plazaRefined, setPlazaRefined] = useState<{ lat: number; lng: number } | null>(null);

  const displayStops: WalkStop[] = useMemo(() => {
    if (!plazaRefined) return WAITING_WALK_STOPS;
    return WAITING_WALK_STOPS.map((s, i) =>
      i === 2 ? { ...s, lat: plazaRefined.lat, lng: plazaRefined.lng } : s,
    );
  }, [plazaRefined]);

  const segments = useMemo(() => getWalkSegmentsForStops(displayStops), [displayStops]);

  useEffect(() => {
    let cancelled = false;

    const cleanup = () => {
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
      mapInstanceRef.current = null;
    };

    const initMap = () => {
      if (cancelled || !mapRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kakao = (window as any).kakao;
      if (!kakao?.maps) return;

      const stops = WAITING_WALK_STOPS;
      const centerLat = stops.reduce((a, s) => a + s.lat, 0) / stops.length;
      const centerLng = stops.reduce((a, s) => a + s.lng, 0) / stops.length;

      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(centerLat, centerLng),
        level: 5,
      });

      const bounds = new kakao.maps.LatLngBounds();
      stops.forEach((s) => bounds.extend(new kakao.maps.LatLng(s.lat, s.lng)));
      map.setBounds(bounds);

      const path = stops.map((s) => new kakao.maps.LatLng(s.lat, s.lng));
      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: "#1d4ed8",
        strokeOpacity: 0.88,
        strokeStyle: "dash",
      });
      polyline.setMap(map);
      polylineRef.current = polyline;

      const overlays: Array<{
        setMap: (v: unknown) => void;
        setPosition?: (ll: unknown) => void;
      }> = [];
      stops.forEach((s) => {
        const el = document.createElement("div");
        el.textContent = String(s.order);
        el.style.cssText =
          "display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:#1d4ed8;color:#fff;font-size:13px;font-weight:800;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);";
        const ov = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(s.lat, s.lng),
          content: el,
          yAnchor: 0.5,
          xAnchor: 0.5,
        });
        ov.setMap(map);
        overlays.push(ov);
      });
      overlaysRef.current = overlays;
      mapInstanceRef.current = map;

      if (kakao.maps.services?.Places) {
        const places = new kakao.maps.services.Places();
        places.keywordSearch(
          EVENT_PLAZA_PLACES_QUERY,
          (data: Array<{ y: string; x: string }>, status: string) => {
            if (cancelled) return;
            if (status !== kakao.maps.services.Status.OK || !data?.[0]) return;
            const lat = Number(data[0].y);
            const lng = Number(data[0].x);
            const ll = new kakao.maps.LatLng(lat, lng);
            const nextPath = [
              new kakao.maps.LatLng(stops[0]!.lat, stops[0]!.lng),
              new kakao.maps.LatLng(stops[1]!.lat, stops[1]!.lng),
              ll,
            ];
            polyline.setPath(nextPath);
            const third = overlays[2];
            if (third?.setPosition) third.setPosition(ll);
            const b = new kakao.maps.LatLngBounds();
            nextPath.forEach((p) => b.extend(p));
            map.setBounds(b);
            if (!cancelled) setPlazaRefined({ lat, lng });
          },
        );
      }
    };

    const apiKey = import.meta.env.VITE_KAKAO_MAPS_API_KEY as string | undefined;
    if (!apiKey) {
      setMapError(
        "카카오맵 API 키가 필요합니다.\n(Kakao Map API key required in .env)",
      );
      return cleanup;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadCallback = () => {
      if (!cancelled) initMap();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).kakao?.maps) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).kakao.maps.load(loadCallback);
    } else {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const kakao = (window as any).kakao;
        if (!kakao?.maps) {
          setMapError(
            "카카오맵을 불러오지 못했습니다. API 키·도메인을 확인해 주세요.\n(Kakao Map failed to load.)",
          );
          return;
        }
        kakao.maps.load(loadCallback);
      };
      script.onerror = () =>
        setMapError("카카오맵 스크립트 로드에 실패했습니다.\n(Map script failed to load.)");
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <StackHeader title={primary("산책 루트 추천", "Suggested walk route")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative h-[min(42vh,280px)] w-full shrink-0 border-b border-border bg-muted">
          <div ref={mapRef} className="absolute inset-0 h-full w-full" />
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/95 px-g4 text-center">
              <p className="type-caption whitespace-pre-line text-muted-foreground">{mapError}</p>
            </div>
          )}
        </div>

        <div className="px-g4 py-g4">
          <p className="type-body text-foreground">
            {primary(
              "대기 시간 동안 가볍게 둘러볼 수 있는 코스를 추천드려요!",
              "We suggest a light route to enjoy while you wait.",
            )}
          </p>

          <ol className="mt-g5 space-y-0">
            {displayStops.map((stop, idx) => (
              <li key={stop.order}>
                <div className="flex gap-g3">
                  <div className="flex flex-col items-center pt-1">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-sm",
                        "bg-brand-royal",
                      )}
                    >
                      {stop.order}
                    </span>
                    {idx < displayStops.length - 1 && (
                      <span className="my-1 w-0.5 flex-1 min-h-[28px] bg-border" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-g5">
                    <p className="type-body font-bold text-foreground">
                      {primary(stop.titleKo, stop.titleEn)}
                    </p>
                    <p className="mt-g1 type-caption text-muted-foreground">
                      {primary(stop.blurbKo, stop.blurbEn)}
                    </p>
                    {idx < segments.length && (
                      <p className="mt-g2 type-caption tabular-nums text-muted-foreground">
                        {primary(
                          `다음까지 직선 약 ${Math.round(segments[idx]!.distanceM)}m · 도보 약 ${segments[idx]!.walkMinutes}분`,
                          `Next: ~${Math.round(segments[idx]!.distanceM)}m straight · ~${segments[idx]!.walkMinutes} min walk`,
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
