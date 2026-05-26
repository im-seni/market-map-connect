import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Star,
  Clock,
  Users,
  Ticket,
  ChevronDown,
  SlidersHorizontal,
  X,
  Map as MapIcon,
  LayoutList,
  Heart,
} from "lucide-react";
import { TopUtilityBar } from "@/components/app/TopUtilityBar";
import { AppButton } from "@/components/app/AppButton";
import { FilterChip } from "@/components/app/FilterChip";
import { DiningStoreDetailScroll } from "@/components/dining/DiningStoreDetailScroll";
import {
  stores,
  type Store,
  type StoreType,
  getVendorStatus,
  waitTimeColorClass,
  getBakeryStock,
} from "@/data/stores";
import { useQueue } from "@/contexts/QueueContext";
import { useCoupons } from "@/contexts/CouponsContext";
import { useSavedStores } from "@/contexts/SavedStoresContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import {
  storeMatchesListFilters,
  type RatingListFilter,
  type WaitListFilter,
} from "@/lib/storeListFilters";
import { EVENT_PLAZA_PLACES_QUERY } from "@/data/yeonanMapAnchors";

const ROAD_START_ADDRESS = "인천 중구 연안부두로33번길 37"; // 인천종합어시장
const FALLBACK_ROAD_START = { lat: 37.4541, lng: 126.6065 };
const PALMIDO_CRUISE_ANCHOR = { lat: 37.4554620594447, lng: 126.601858565657 };
const FALLBACK_FERRY_TERMINAL = {
  lat: PALMIDO_CRUISE_ANCHOR.lat + 0.00095,
  lng: PALMIDO_CRUISE_ANCHOR.lng - 0.00115,
};
const FALLBACK_ROAD_END = PALMIDO_CRUISE_ANCHOR;
const DETAIL_CORRIDOR_START_KEYWORD = "인천옹진농협";
const DETAIL_CORRIDOR_END_KEYWORD = "회손질생새우제일바다";
const PANCAKE_ANCHOR_KEYWORD = "장터순대";
/** 인천항 연안 여객 터미널 — 미니 요트 승선 핀(🚢) */
const FERRY_TERMINAL_PLACES_QUERY = "인천항연안여객터미널";
type CategoryNode = {
  emoji: string;
  label: string;
  labelEn: string;
  storeIds: string[];
  side: "upper" | "lower";
  anchorT: number;
  forcedLevel?: "low" | "moderate" | "busy";
};
const CATEGORY_NODES: CategoryNode[] = [
  { emoji: "🐟", label: "어시장", labelEn: "Fish Market", storeIds: ["9", "10", "11", "12", "13"], forcedLevel: "moderate" as const, side: "lower" as const, anchorT: 0.12 },
  { emoji: "🦀", label: "포장마차", labelEn: "Street Stalls", storeIds: ["5", "14"], side: "lower" as const, anchorT: 0.2 },
  { emoji: "🧋", label: "음료", labelEn: "Drinks", storeIds: ["2", "3"], side: "lower" as const, anchorT: 0.5 },
  { emoji: "🍭", label: "디저트", labelEn: "Dessert", storeIds: ["4", "6", "8"], side: "lower" as const, anchorT: 0.62 },
  { emoji: "🍢", label: "간식", labelEn: "Snacks", storeIds: ["1", "7"], side: "lower" as const, anchorT: 0.93 },
  { emoji: "🥐", label: "팝업 베이커리", labelEn: "Popup Bakery", storeIds: ["16"], forcedLevel: "moderate" as const, side: "upper" as const, anchorT: 0.42 },
] as const;
const DETAIL_ONLY_ZOOM_LEVEL = 2; // 기본(level 4)에서 2번 확대하면 level 2
const ROAD_SIDE_INVERT = true; // 실제 지도 체감 방향과 수학 방향이 반대일 때 보정
const DETAIL_PIN_ROAD_EDGE_OFFSET = 0.00016; // 도로 중심선에서 아래쪽으로 추가 이동
/** 같은 카테고리 세부 핀들을 도로 방향으로 살짝 벌려 겹침 방지 */
const DETAIL_PIN_CLUSTER_SPREAD = 0.00013;
const FISH_REPRESENTATIVE_UP_OFFSET = 0.0005; // 물고기 대표 핀 위쪽 보정
const FISH_REPRESENTATIVE_LEFT_OFFSET = 0.0005; // 물고기 대표 핀 왼쪽 보정

const typeFilters: { id: StoreType | "all"; ko: string; en: string }[] = [
  { id: "all",        ko: "전체",             en: "All"              },
  { id: "bakery",     ko: "🥐 팝업 베이커리", en: "Popup Bakery"     },
  { id: "food_court", ko: "포장마차",         en: "Food Court"       },
  { id: "food_truck", ko: "푸드트럭",         en: "Food Truck"       },
  { id: "restaurant", ko: "어시장 식당",      en: "Market hall dining" },
];

function vendorStatusTone(store: Store, primary: (ko: string, en: string) => string) {
  const s = getVendorStatus(store);
  if (s === "open") return { text: primary("영업 중", "Open"), className: "text-sky-600" };
  if (s === "pre_open") return { text: primary("영업 전", "Before opening"), className: "text-amber-600" };
  if (s === "sold_out") return { text: primary("품절", "Sold out"), className: "text-red-600" };
  return { text: primary("영업 마감", "Closed"), className: "text-red-600" };
}

const storePhotosById: Record<string, string[]> = {
  "1": ["https://images.unsplash.com/photo-1559847844-5315695dadae?w=900&auto=format&fit=crop"],
  "2": ["https://images.unsplash.com/photo-1632818924360-68d4994cfdb2?w=900&auto=format&fit=crop"],
  "3": ["https://images.unsplash.com/photo-1558857563-b371033873b8?w=900&auto=format&fit=crop"],
  "4": ["https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=900&auto=format&fit=crop"],
  "5": ["https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=900&auto=format&fit=crop"],
  "6": ["https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=900&auto=format&fit=crop"],
  "7": ["https://images.unsplash.com/photo-1626082927389-6cd097cdcaea?w=900&auto=format&fit=crop"],
  "8": ["https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&auto=format&fit=crop"],
  "9": ["https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=900&auto=format&fit=crop"],
  "10": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900&auto=format&fit=crop"],
  "11": ["https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=900&auto=format&fit=crop"],
  "12": ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop"],
  "13": ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop"],
  "14": ["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&auto=format&fit=crop"],
  "15": ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&auto=format&fit=crop"],
  "16": ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&auto=format&fit=crop"],
};

const storeAddressById: Record<string, string> = {
  "1": "인천 중구 연안부두로 31",
  "2": "인천 중구 연안부두로 34",
  "3": "인천 중구 연안부두로 36",
  "4": "인천 중구 연안부두로 39",
  "5": "인천 중구 연안부두로33번길 37",
  "6": "인천 중구 연안부두로 41",
  "7": "인천 중구 연안부두로 42",
  "8": "인천 중구 연안부두로 40",
  "9": "인천 중구 연안부두로33번길 37",
  "10": "인천 중구 연안부두로33번길 37",
  "11": "인천 중구 연안부두로33번길 37",
  "12": "인천 중구 연안부두로33번길 37",
  "13": "인천 중구 연안부두로33번길 37",
  "14": "인천 중구 연안부두로33번길 35",
  "15": "인천 중구 연안부두로 일대 · 연안 여객 터미널",
  "16": "인천 중구 연안부두로 35 (팝업 부스)",
};

function formatStoreAddress(store: Store, primaryFn: (ko: string, en: string) => string): string {
  const base = storeAddressById[store.id] ?? "";
  if (!store.floorLabel) return base;
  const floor = primaryFn(store.floorLabel.ko, store.floorLabel.en);
  return `${base} · ${floor}`;
}

export default function DiningMapsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { primary } = useLanguage();
  const { user } = useSupabaseAuth();
  const { ticketFor, joinQueue, leaveQueue } = useQueue();
  const { coupons } = useCoupons();
  const { isSaved, toggleSaved } = useSavedStores();

  /** 지도「쿠폰 사용 가능」필터: 음식 점포 쿠폰만. 미니 요트(15) 할인권은 별도 시나리오라 제외 */
  const couponUsableStoreIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of coupons) {
      if (c.state !== "active" || !c.vendorId) continue;
      if (c.vendorId === "15") continue;
      ids.add(c.vendorId);
    }
    return ids;
  }, [coupons]);

  const mapRef = useRef<HTMLDivElement>(null);
  /** zoom/drag 등 이벤트에서 항상 최신 마커 렌더 함수 호출 (오래된 클로저로 세부 핀 소실 방지) */
  const renderStoreOverlaysRef = useRef<(targets: Store[], highlight?: string | null) => void>(() => {});
  const mapInstanceRef = useRef<unknown>(null);
  const overlaysRef = useRef<unknown[]>([]);
  const listenersCleanupRef = useRef<(() => void) | null>(null);
  const zoomListenerRef = useRef<(() => void) | null>(null);
  const dragListenerRef = useRef<(() => void) | null>(null);
  const onStoreClickRef = useRef<(s: Store) => void>(() => {});
  const roadCoordsRef = useRef({
    start: FALLBACK_ROAD_START,
    end: FALLBACK_ROAD_END,
    center: {
      lat: (FALLBACK_ROAD_START.lat + FALLBACK_ROAD_END.lat) / 2,
      lng: (FALLBACK_ROAD_START.lng + FALLBACK_ROAD_END.lng) / 2,
    },
  });
  const detailCorridorRef = useRef({
    start: FALLBACK_ROAD_START,
    end: FALLBACK_ROAD_END,
  });
  const keywordAnchorRef = useRef<{
    ongjin: { lat: number; lng: number } | null;
    pancake: { lat: number; lng: number } | null;
  }>({
    ongjin: null,
    pancake: null,
  });

  /** 야외 이벤트 광장(🎬) — 키워드 검색 실패 시 도로 중심·시작 중간값으로 폴백 */
  const eventPlazaPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const openEventFromMapRef = useRef<() => void>(() => {});
  /** 연안 여객 터미널(🚢) — 키워드 실패 시 팔미도 쪽 앵커로 폴백 */
  const ferryTerminalPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const openYachtEventFromMapRef = useRef<() => void>(() => {});

  /** 이벤트에서 /map 진입 시: 키워드로 잡힌 🎬/🚢 좌표가 끝난 뒤에도 다시 맞춤 (첫 프레임은 폴백 좌표) */
  const pendingMapFocusPinRef = useRef<"eventPlaza" | "ferryTerminal" | null>(null);
  const applyPendingMapFocus = useCallback(() => {
    const pin = pendingMapFocusPinRef.current;
    if (!pin) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    if (!kakao?.maps || !map?.setCenter) return;
    const rc = roadCoordsRef.current;
    const plazaFallback = {
      lat: (rc.start.lat + rc.center.lat) / 2 + 0.00028,
      lng: (rc.start.lng + rc.center.lng) / 2 + 0.00014,
    };
    const pos =
      pin === "eventPlaza"
        ? eventPlazaPositionRef.current ?? plazaFallback
        : ferryTerminalPositionRef.current ?? FALLBACK_FERRY_TERMINAL;
    map.setLevel(2);
    const ll = new kakao.maps.LatLng(pos.lat, pos.lng);
    map.setCenter(ll);
    map.relayout?.();
    requestAnimationFrame(() => {
      map.setCenter(ll);
      map.relayout?.();
    });
  }, []);

  useEffect(() => {
    openEventFromMapRef.current = () =>
      navigate("/event", { state: { eventTab: "outdoor" } });
  }, [navigate]);

  useEffect(() => {
    openYachtEventFromMapRef.current = () =>
      navigate("/event", { state: { eventTab: "yacht" } });
  }, [navigate]);

  /** 바텀시트 상세 진입 직전 지도 중심·줌 (닫을 때 동일 뷰로 복구) */
  const mapViewportSnapshotRef = useRef<{ lat: number; lng: number; level: number } | null>(null);
  /** 상세 닫은 직후 road 중심 자동 이동 1회 스킵(스냅샷 복구 유지) */
  const suppressRoadCenterOnceRef = useRef(false);

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeCategoryLabel, setActiveCategoryLabel] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<"list" | "detail" | null>(null);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<StoreType | "all">("all");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [diningSurface, setDiningSurface] = useState<"map" | "list">("map");
  /** 초기값을 map으로 두면 첫 패시브 이펙트에서 표면 전환 오판 → 목록 상세가 즉시 닫힘(undefined 사용) */
  const prevDiningSurfaceRef = useRef<"map" | "list" | undefined>(undefined);
  /** 목록 탭에서 매장 선택 시 전체 화면 상세 */
  const [listDetailOpen, setListDetailOpen] = useState(false);
  /** 웨이팅 탭에서 들어온 목록형 상세인 경우 돌아가기 시 /waiting 로 보냄 */
  const [listDetailOpenedFromWaiting, setListDetailOpenedFromWaiting] = useState(false);
  /** 마이 > 저장한 상점 / 방문 기록 등에서 온 경우 뒤로가기 시 해당 경로로 */
  const [listDetailReturnTo, setListDetailReturnTo] = useState<string | null>(null);
  type ListSortKey = "wait" | "popular";
  const [appliedWait, setAppliedWait] = useState<WaitListFilter>("all");
  const [appliedRating, setAppliedRating] = useState<RatingListFilter>("all");
  const [draftWait, setDraftWait] = useState<WaitListFilter>("all");
  const [draftRating, setDraftRating] = useState<RatingListFilter>("all");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [listCouponOnly, setListCouponOnly] = useState(false);
  const [listSort, setListSort] = useState<ListSortKey>("wait");
  const [sortChoiceExplicit, setSortChoiceExplicit] = useState(false);
  const [listSortTick, setListSortTick] = useState(0);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortMenuPos, setSortMenuPos] = useState<{ top: number; left: number; minWidth: number } | null>(null);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [reviewMenuModalOpen, setReviewMenuModalOpen] = useState(false);
  const [reviewMenuDraft, setReviewMenuDraft] = useState<string[]>([]);
  const [reviewAppliedMenus, setReviewAppliedMenus] = useState<string[]>([]);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const sortWrapRef = useRef<HTMLDivElement>(null);

  const visibleCategoryLabels = useMemo(() => {
    if (activeFilter === "all") return CATEGORY_NODES.map((n) => n.label);
    if (activeFilter === "food_truck") return ["간식", "디저트", "음료/스낵"];
    if (activeFilter === "food_court") return ["포장마차"];
    if (activeFilter === "restaurant") return ["어시장"];
    if (activeFilter === "bakery") return ["팝업 베이커리"];
    return CATEGORY_NODES.map((n) => n.label);
  }, [activeFilter]);

  const visibleCategoryNodes = useMemo(
    () => CATEGORY_NODES.filter((n) => visibleCategoryLabels.includes(n.label)),
    [visibleCategoryLabels]
  );

  const filteredStores = useMemo(() => {
    const ids = new Set(visibleCategoryNodes.flatMap((n) => n.storeIds));
    return stores.filter((s) => ids.has(s.id));
  }, [visibleCategoryNodes]);

  const categoryForStore = useCallback(
    (store: Store) => CATEGORY_NODES.find((node) => node.storeIds.includes(store.id)),
    []
  );

  const captureMapViewportSnapshot = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = typeof window !== "undefined" ? (window as any).kakao : undefined;
    if (!map?.getCenter || !kakao?.maps) return;
    const c = map.getCenter();
    mapViewportSnapshotRef.current = {
      lat: c.getLat(),
      lng: c.getLng(),
      level: typeof map.getLevel === "function" ? (map.getLevel() as number) : 4,
    };
  }, []);

  /** 웨이팅·알림·마이(저장/방문) 등에서 「목록」과 동일한 전체 화면 가게 상세로 진입 (목록 카드 탭과 동일 UI) */
  useLayoutEffect(() => {
    const st = location.state as
      | { waitingDetailStoreId?: string; fromWaiting?: boolean; returnTo?: string }
      | undefined;
    const raw = st?.waitingDetailStoreId;
    if (raw === undefined || raw === null || raw === "") return;

    const sid = String(raw);
    const fromWaiting = !!st?.fromWaiting;
    const ret =
      typeof st?.returnTo === "string" && st.returnTo.startsWith("/") ? st.returnTo : null;
    const store = stores.find((s) => s.id === sid);

    if (!store) {
      navigate(".", { replace: true, state: {} });
      return;
    }

    setListDetailOpenedFromWaiting(fromWaiting);
    setListDetailReturnTo(ret);
    setSelectedStore(store);
    setActiveCategoryLabel(categoryForStore(store)?.label ?? null);
    setReviewAppliedMenus([]);
    setReviewMenuDraft([]);
    setReviewMenuModalOpen(false);
    setMenuExpanded(false);
    setReviewsExpanded(false);
    setDetailExpanded(false);
    setSheetMode(null);
    setListDetailOpen(true);
    setDiningSurface("list");

    /** 라우터 state 비우기는 화면 상태 세팅 뒤에 해야 한다. 먼저 비우면 같은 effect가 재실행되며 미적용될 수 있음 */
    navigate(".", { replace: true, state: {} });
  }, [location.state, navigate, categoryForStore]);

  /** 이벤트 화면에서 「지도에서 보기」— 야외 광장(🎬) 또는 여객터미널(🚢) 핀 좌표에 맞춤(검색 완료 후 `applyPendingMapFocus`로 보정) */
  useLayoutEffect(() => {
    const st = location.state as { mapFocusPin?: "eventPlaza" | "ferryTerminal" } | undefined;
    const pin = st?.mapFocusPin;
    if (!pin) return;
    pendingMapFocusPinRef.current = pin;
    if (!mapLoaded) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    if (!kakao?.maps || !map?.setCenter) return;

    setDiningSurface("map");
    applyPendingMapFocus();
    renderStoreOverlaysRef.current(filteredStoresRef.current, mapFocusHighlightRef.current);
    window.setTimeout(() => {
      applyPendingMapFocus();
      renderStoreOverlaysRef.current(filteredStoresRef.current, mapFocusHighlightRef.current);
    }, 400);
    navigate(".", { replace: true, state: {} });
  }, [location.state, mapLoaded, navigate, applyPendingMapFocus]);

  onStoreClickRef.current = (s: Store) => {
    captureMapViewportSnapshot();
    setListDetailOpen(false);
    setSelectedStore(s);
    setActiveCategoryLabel(categoryForStore(s)?.label ?? null);
    setReviewAppliedMenus([]);
    setReviewMenuDraft([]);
    setReviewMenuModalOpen(false);
    setSheetMode("detail");
    setDetailExpanded(false);
  };

  const activeCategory = useMemo(
    () => CATEGORY_NODES.find((n) => n.label === activeCategoryLabel) ?? null,
    [activeCategoryLabel]
  );
  const categoryStores = useMemo(
    () => (activeCategory ? stores.filter((s) => activeCategory.storeIds.includes(s.id)) : []),
    [activeCategory]
  );

  const filteredCategoryStores = useMemo(() => {
    const filterArgs = { wait: appliedWait, rating: appliedRating };
    const filtered = categoryStores.filter((s) => {
      if (!storeMatchesListFilters(s, filterArgs)) return false;
      if (listCouponOnly && !couponUsableStoreIds.has(s.id)) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (listSort === "wait") return a.waitTime - b.waitTime || b.rating - a.rating;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews.length - a.reviews.length || a.waitTime - b.waitTime;
    });
  }, [categoryStores, appliedWait, appliedRating, listCouponOnly, couponUsableStoreIds, listSort, listSortTick]);

  /** 전체 목록 탭(지도와 동일한 매장 집합)용 */
  const browseListStores = useMemo(() => {
    const filterArgs = { wait: appliedWait, rating: appliedRating };
    const filtered = filteredStores.filter((s) => storeMatchesListFilters(s, filterArgs));
    return [...filtered].sort((a, b) => {
      if (listSort === "wait") return a.waitTime - b.waitTime || b.rating - a.rating;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews.length - a.reviews.length || a.waitTime - b.waitTime;
    });
  }, [filteredStores, appliedWait, appliedRating, listSort, listSortTick]);

  const filteredStoresRef = useRef(filteredStores);
  filteredStoresRef.current = filteredStores;

  const mapFocusHighlightId =
    diningSurface === "map" && sheetMode === "detail" && selectedStore ? selectedStore.id : null;
  const mapFocusHighlightRef = useRef<string | null>(null);
  mapFocusHighlightRef.current = mapFocusHighlightId;

  const filterPreviewCount = useMemo(() => {
    const filterArgs = { wait: draftWait, rating: draftRating };
    const fromSheetCategory = sheetMode === "list" && activeCategory;
    const base = fromSheetCategory ? categoryStores : filteredStores;
    return base.filter((s) => {
      if (!storeMatchesListFilters(s, filterArgs)) return false;
      if (fromSheetCategory && listCouponOnly && !couponUsableStoreIds.has(s.id)) return false;
      return true;
    }).length;
  }, [
    sheetMode,
    activeCategory,
    categoryStores,
    filteredStores,
    draftWait,
    draftRating,
    listCouponOnly,
    couponUsableStoreIds,
  ]);

  useEffect(() => {
    setAppliedWait("all");
    setAppliedRating("all");
    setDraftWait("all");
    setDraftRating("all");
    setListCouponOnly(false);
    setListSort("wait");
    setSortChoiceExplicit(false);
    setListSortTick(0);
    setSortMenuOpen(false);
    setFilterModalOpen(false);
  }, [activeCategoryLabel]);

  /** 지도↔목록 전환 시 정렬·바텀시트 정리. 목록 상세 닫기는 「목록 탭에서 나갈 때만」(첫 마운트에서 map일 때 닫지 않음 → 웨이팅 딥링크 유지) */
  useEffect(() => {
    const prev = prevDiningSurfaceRef.current;
    prevDiningSurfaceRef.current = diningSurface;

    if (diningSurface === "list" && prev === "map") {
      setListSort("popular");
      setSortChoiceExplicit(true);
      setListSortTick((t) => t + 1);
    }

    if (diningSurface !== "list") {
      if (prev === "list") {
        setListDetailOpen(false);
        setListDetailReturnTo(null);
      }
      return;
    }

    setSheetMode(null);
    setDetailExpanded(false);
    setSortMenuOpen(false);
    setFilterModalOpen(false);
    if (!listDetailOpen) {
      setSelectedStore(null);
      setActiveCategoryLabel(null);
    }
  }, [diningSurface, listDetailOpen]);

  useEffect(() => {
    if (diningSurface !== "map") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    if (!map?.relayout) return;
    const id = window.setTimeout(() => map.relayout(), 120);
    return () => window.clearTimeout(id);
  }, [diningSurface, mapLoaded]);

  useEffect(() => {
    setMenuExpanded(false);
    setReviewsExpanded(false);
    setReviewAppliedMenus([]);
    setReviewMenuDraft([]);
    setReviewMenuModalOpen(false);
  }, [selectedStore?.id]);

  useLayoutEffect(() => {
    if (sheetMode === "detail") detailScrollRef.current?.scrollTo(0, 0);
    if (sheetMode === "list") listScrollRef.current?.scrollTo(0, 0);
  }, [sheetMode, selectedStore?.id]);

  useLayoutEffect(() => {
    if (!sortMenuOpen || !sortWrapRef.current) {
      setSortMenuPos(null);
      return;
    }
    const r = sortWrapRef.current.getBoundingClientRect();
    setSortMenuPos({ top: r.bottom + 6, left: r.left, minWidth: Math.max(180, r.width) });
  }, [sortMenuOpen]);

  useEffect(() => {
    if (!sortMenuOpen) return;
    const upd = () => {
      if (!sortWrapRef.current) return;
      const r = sortWrapRef.current.getBoundingClientRect();
      setSortMenuPos({ top: r.bottom + 6, left: r.left, minWidth: Math.max(180, r.width) });
    };
    window.addEventListener("scroll", upd, true);
    window.addEventListener("resize", upd);
    return () => {
      window.removeEventListener("scroll", upd, true);
      window.removeEventListener("resize", upd);
    };
  }, [sortMenuOpen]);

  useEffect(() => {
    if (!sortMenuOpen) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sortWrapRef.current?.contains(t)) return;
      if (document.getElementById("dining-sort-portal")?.contains(t)) return;
      setSortMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [sortMenuOpen]);

  const placeStoreOnRoad = useCallback((index: number, total: number, startPad = 0.08, endPad = 0.08) => {
    const { start, end } = roadCoordsRef.current;
    const t = total <= 1 ? 0.5 : index / (total - 1);
    const normalizedT = startPad + t * (1 - startPad - endPad);
    return {
      lat: start.lat + (end.lat - start.lat) * normalizedT,
      lng: start.lng + (end.lng - start.lng) * normalizedT,
    };
  }, []);

  const offsetAlongRoadSide = useCallback((point: { lat: number; lng: number }, side: "upper" | "lower", amount = 0.00016) => {
    const { start, end } = detailCorridorRef.current;
    const vx = end.lng - start.lng;
    const vy = end.lat - start.lat;
    const mag = Math.hypot(vx, vy) || 1;
    const nx = -vy / mag;
    const ny = vx / mag;
    const sideSign = (side === "upper" ? 1 : -1) * (ROAD_SIDE_INVERT ? -1 : 1);
    return {
      lat: point.lat + ny * amount * sideSign,
      lng: point.lng + nx * amount * sideSign,
    };
  }, []);

  /** 도로 중심선 방향(접선)으로 부호 있는 오프셋 — 다수 세부 핀을 인근에 벌려 배치 */
  const offsetAlongTangent = useCallback((point: { lat: number; lng: number }, signedScalar: number) => {
    const { start, end } = detailCorridorRef.current;
    const vx = end.lng - start.lng;
    const vy = end.lat - start.lat;
    const mag = Math.hypot(vx, vy) || 1;
    const tx = vx / mag;
    const ty = vy / mag;
    return {
      lat: point.lat + ty * signedScalar,
      lng: point.lng + tx * signedScalar,
    };
  }, []);

  const positionByAnchorT = useCallback((t: number) => {
    const { start, end } = roadCoordsRef.current;
    const clamped = Math.max(0, Math.min(1, t));
    return {
      lat: start.lat + (end.lat - start.lat) * clamped,
      lng: start.lng + (end.lng - start.lng) * clamped,
    };
  }, []);

  const resolveCategoryAnchor = useCallback(
    (node: CategoryNode, index: number) => {
      if (node.label === "어시장") return roadCoordsRef.current.start;
      if (node.label === "포장마차" && keywordAnchorRef.current.ongjin) return keywordAnchorRef.current.ongjin;
      if (node.label === "간식" && keywordAnchorRef.current.pancake) return keywordAnchorRef.current.pancake;
      if (typeof node.anchorT === "number") return positionByAnchorT(node.anchorT);
      return placeStoreOnRoad(index, CATEGORY_NODES.length, 0.06, 0.1);
    },
    [placeStoreOnRoad, positionByAnchorT]
  );

  /**
   * 어시장 제외 카테고리 세부 핀 좌표(확대 뷰) — node.storeIds 순으로 인근 도로 방향 분산.
   * 지도 포커스/하이라이트에도 동일 사용.
   */
  const computeDetailPinLatLng = useCallback(
    (store: Store): { lat: number; lng: number } => {
      const node = CATEGORY_NODES.find((n) => n.storeIds.includes(store.id));
      if (!node) return { lat: store.lat, lng: store.lng };
      if (node.label === "어시장") return { lat: store.lat, lng: store.lng };

      const anchorIdxInVisible = visibleCategoryNodes.findIndex((n) => n.label === node.label);
      if (anchorIdxInVisible < 0) return { lat: store.lat, lng: store.lng };

      const orderedStores = node.storeIds
        .map((id) => stores.find((s) => s.id === id))
        .filter((s): s is Store => !!s);
      const childIdx = orderedStores.findIndex((s) => s.id === store.id);
      if (childIdx < 0) return { lat: store.lat, lng: store.lng };

      const roadBasePos = resolveCategoryAnchor(node, anchorIdxInVisible);
      const roadPos = offsetAlongRoadSide(roadBasePos, node.side);

      const count = orderedStores.length;
      const spread = DETAIL_PIN_CLUSTER_SPREAD * (count >= 4 ? 1.28 : 1.12);
      const signedAlong = count <= 1 ? 0 : (childIdx - (count - 1) / 2) * spread;

      let p = offsetAlongTangent(roadPos, signedAlong);
      if (count > 1) {
        const bump = DETAIL_PIN_ROAD_EDGE_OFFSET * ((childIdx % 2) * 2 - 1) * (0.2 + Math.floor(childIdx / 2) * 0.06);
        p = offsetAlongRoadSide(p, node.side === "lower" ? "upper" : "lower", bump);
      }
      const edgeAmount = DETAIL_PIN_ROAD_EDGE_OFFSET * (0.45 + (childIdx % 3) * 0.04);
      const nearSide = offsetAlongRoadSide(p, node.side, edgeAmount);
      return { lat: nearSide.lat, lng: nearSide.lng };
    },
    [visibleCategoryNodes, resolveCategoryAnchor, offsetAlongRoadSide, offsetAlongTangent]
  );

  const computeStoreMapFocusLatLng = useCallback(
    (s: Store) => computeDetailPinLatLng(s),
    [computeDetailPinLatLng]
  );

  const clearOverlays = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overlaysRef.current.forEach((overlay: any) => overlay?.setMap?.(null));
    overlaysRef.current = [];
  }, []);

  const makeDetailPin = useCallback((emoji: string, label: string, borderColor: string, haloColor: string) => {
    const pin = document.createElement("button");
    pin.type = "button";
    pin.setAttribute("aria-label", label);
    pin.style.cssText =
      "position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:rgba(255,255,255,0.96);box-shadow:0 3px 10px rgba(0,0,0,0.2);font-size:17px;cursor:pointer;";
    pin.style.border = `2px solid ${borderColor}`;
    const halo = document.createElement("span");
    halo.style.cssText = "position:absolute;inset:-7px;border-radius:9999px;pointer-events:none;";
    halo.style.background = haloColor;
    pin.appendChild(halo);
    const emojiLayer = document.createElement("span");
    emojiLayer.style.cssText = "position:relative;z-index:1;";
    emojiLayer.textContent = emoji;
    pin.appendChild(emojiLayer);
    return pin;
  }, []);

  const queueVisualByAverage = useCallback((minutes: number) => {
    if (minutes <= 8) {
      return { border: "#52c41a", halo: "rgba(82,196,26,0.22)", badge: "#52c41a" };
    }
    if (minutes <= 16) {
      return { border: "#faad14", halo: "rgba(250,173,20,0.22)", badge: "#faad14" };
    }
    return { border: "#ff4d4f", halo: "rgba(255,77,79,0.24)", badge: "#ff4d4f" };
  }, []);

  const styleForCategory = useCallback((avgWait: number, forcedLevel?: "low" | "moderate" | "busy") => {
    if (forcedLevel === "low") return queueVisualByAverage(6);
    if (forcedLevel === "moderate") return queueVisualByAverage(12);
    if (forcedLevel === "busy") return queueVisualByAverage(24);
    return queueVisualByAverage(avgWait);
  }, [queueVisualByAverage]);

  const createCircleEmojiMarker = useCallback((emoji: string, ariaLabel: string) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.setAttribute("aria-label", ariaLabel);
    marker.style.cssText =
      "width:40px;height:40px;border-radius:9999px;background:rgba(255,255,255,0.96);border:2px solid rgba(12,26,42,0.18);display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1;box-shadow:0 6px 18px rgba(0,0,0,0.22);cursor:pointer;";
    marker.textContent = emoji;
    return marker;
  }, []);

  const createCategoryMarker = useCallback(
    (emoji: string, ariaLabel: string, avgWait: number, forcedLevel?: "low" | "moderate" | "busy", compact?: boolean) => {
      const style = styleForCategory(avgWait, forcedLevel);
      const size = compact ? 38 : 46;
      const fontPx = compact ? 19 : 23;
      const haloPad = compact ? -8 : -10;
      const marker = document.createElement("button");
      marker.type = "button";
      marker.setAttribute("aria-label", ariaLabel);
      marker.style.cssText = `position:relative;width:${size}px;height:${size}px;border-radius:9999px;background:rgba(255,255,255,0.97);display:flex;align-items:center;justify-content:center;font-size:${fontPx}px;line-height:1;box-shadow:0 6px 18px rgba(0,0,0,0.2);cursor:pointer;`;
      marker.style.border = `2px solid ${style.border}`;

      const halo = document.createElement("span");
      halo.style.cssText = `position:absolute;inset:${haloPad}px;border-radius:9999px;pointer-events:none;`;
      halo.style.background = style.halo;
      marker.appendChild(halo);

      const emojiLayer = document.createElement("span");
      emojiLayer.style.cssText = "position:relative;z-index:1;";
      emojiLayer.textContent = emoji;
      marker.appendChild(emojiLayer);

      return marker;
    },
    [styleForCategory]
  );

  const renderStoreOverlays = useCallback(
    (targetStores: Store[], highlightStoreId?: string | null) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kakao = (window as any).kakao;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = mapInstanceRef.current as any;
      if (!kakao?.maps || !map) return;

      clearOverlays();
      const zoomLevel = map.getLevel?.() ?? 4;
      const compactMarkers = zoomLevel > DETAIL_ONLY_ZOOM_LEVEL;
      const fishNode = visibleCategoryNodes.find((node) => node.label === "어시장");
      if (fishNode) {
        const fishStores = stores.filter((store) => fishNode.storeIds.includes(store.id));
        const fishAvg = fishStores.length > 0 ? fishStores.reduce((sum, s) => sum + s.waitTime, 0) / fishStores.length : 10;
        const fishMarker = createCategoryMarker(fishNode.emoji, fishNode.label, fishAvg, undefined, compactMarkers);
        const fishFeatured = stores.find((store) => fishNode.storeIds.includes(store.id));
        if (fishFeatured) {
          fishMarker.addEventListener("click", (e) => {
            e.stopPropagation();
            setActiveCategoryLabel(fishNode.label);
            setSheetMode("list");
            setDetailExpanded(false);
          });
        }
        const fishAnchor = roadCoordsRef.current.start;
        const fishOverlay = new kakao.maps.CustomOverlay({
          map,
          position: new kakao.maps.LatLng(
            fishAnchor.lat + FISH_REPRESENTATIVE_UP_OFFSET,
            fishAnchor.lng - FISH_REPRESENTATIVE_LEFT_OFFSET
          ),
          content: fishMarker,
          yAnchor: 0.5,
        });
        overlaysRef.current.push(fishOverlay);
      }

      if (zoomLevel <= DETAIL_ONLY_ZOOM_LEVEL) {
        // 확대 시: 어시장 제외 카테고리별로 가맹점마다 세부 핀(인근, 겹치지 않게 분산)
        visibleCategoryNodes.forEach((node) => {
          if (node.label === "어시장") return;

          const orderedStores = node.storeIds
            .map((id) => stores.find((s) => s.id === id))
            .filter((s): s is Store => !!s);
          orderedStores.forEach((store) => {
            const { lat, lng } = computeDetailPinLatLng(store);
            const pinStyle = styleForCategory(store.waitTime);
            const detailPin = makeDetailPin(node.emoji, `${node.label} · ${store.name}`, pinStyle.border, pinStyle.halo);
            if (highlightStoreId && store.id === highlightStoreId) {
              detailPin.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.95), 0 10px 28px rgba(0,0,0,0.35)";
              detailPin.style.transform = "scale(1.14)";
              detailPin.style.zIndex = "20";
              detailPin.style.transition = "box-shadow 0.2s ease, transform 0.2s ease";
            }
            detailPin.addEventListener("click", (e) => {
              e.stopPropagation();
              onStoreClickRef.current(store);
            });
            const detailOverlay = new kakao.maps.CustomOverlay({
              map,
              position: new kakao.maps.LatLng(lat, lng),
              content: detailPin,
              yAnchor: 1,
            });
            overlaysRef.current.push(detailOverlay);
          });
        });
      } else {
        visibleCategoryNodes.forEach((node, index) => {
          if (node.label === "어시장") return; // 물고기 대표는 상단에서 항상 렌더링
          const roadBasePos = resolveCategoryAnchor(node, index);
          const roadPos = offsetAlongRoadSide(roadBasePos, node.side);
          const storesInCategory = stores.filter((store) => node.storeIds.includes(store.id));
          const avgWait =
            storesInCategory.length > 0
              ? storesInCategory.reduce((sum, store) => sum + store.waitTime, 0) / storesInCategory.length
              : 10;
          const marker = createCategoryMarker(node.emoji, node.label, avgWait, undefined, compactMarkers);
          const featuredStore =
            targetStores.find((store) => node.storeIds.includes(store.id)) ??
            stores.find((store) => node.storeIds.includes(store.id));
          if (featuredStore) {
            marker.addEventListener("click", (e) => {
              e.stopPropagation();
              setActiveCategoryLabel(node.label);
              setSheetMode("list");
              setDetailExpanded(false);
            });
          }
          const overlay = new kakao.maps.CustomOverlay({
            map,
            position: new kakao.maps.LatLng(roadPos.lat, roadPos.lng),
            content: marker,
            yAnchor: 0.5,
          });
          overlaysRef.current.push(overlay);
        });
      }

      /** 상트페테르부르크 광장 야외 이벤트 — 🎬 원형 핀 클릭 시 이벤트 탭 */
      const rcEv = roadCoordsRef.current;
      const plazaLatLng = eventPlazaPositionRef.current ?? {
        lat: (rcEv.start.lat + rcEv.center.lat) / 2 + 0.00028,
        lng: (rcEv.start.lng + rcEv.center.lng) / 2 + 0.00014,
      };
      const plazaPin = createCircleEmojiMarker(
        "🎬",
        "상트페테르부르크 광장 · 이벤트 · Events · Outdoor cinema",
      );
      plazaPin.style.border = "2px solid rgba(212,160,61,0.92)";
      plazaPin.style.boxShadow = "0 10px 26px rgba(0,0,0,0.26)";
      plazaPin.addEventListener("click", (e) => {
        e.stopPropagation();
        openEventFromMapRef.current();
      });
      const plazaOv = new kakao.maps.CustomOverlay({
        map,
        position: new kakao.maps.LatLng(plazaLatLng.lat, plazaLatLng.lng),
        content: plazaPin,
        yAnchor: 0.5,
        zIndex: 48,
      });
      overlaysRef.current.push(plazaOv);

      /** 인천항 연안 여객 터미널 — 🚢 클릭 시 이벤트(미니 요트) */
      const ft = ferryTerminalPositionRef.current ?? FALLBACK_FERRY_TERMINAL;
      const ferryPin = createCircleEmojiMarker(
        "🚢",
        "인천항 연안 여객 터미널 · Mini yacht · Boarding",
      );
      ferryPin.style.border = "2px solid rgba(30,80,140,0.88)";
      ferryPin.style.boxShadow = "0 10px 26px rgba(0,0,0,0.24)";
      ferryPin.addEventListener("click", (e) => {
        e.stopPropagation();
        openYachtEventFromMapRef.current();
      });
      const ferryOv = new kakao.maps.CustomOverlay({
        map,
        position: new kakao.maps.LatLng(ft.lat, ft.lng),
        content: ferryPin,
        yAnchor: 0.5,
        zIndex: 48,
      });
      overlaysRef.current.push(ferryOv);
    },
    [
      clearOverlays,
      computeDetailPinLatLng,
      createCategoryMarker,
      createCircleEmojiMarker,
      makeDetailPin,
      offsetAlongRoadSide,
      resolveCategoryAnchor,
      styleForCategory,
      visibleCategoryNodes,
    ]
  );

  renderStoreOverlaysRef.current = renderStoreOverlays;

  // ── 카카오맵 초기화 ────────────────────────────────
  const initMap = useCallback(() => {
    if (!mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    if (!kakao?.maps) return;

    /** 필터 변경 시 initMap 참조가 바뀌어도 지도를 다시 만들면 줌이 초기화됨 — 한 번만 생성 */
    if (mapInstanceRef.current) {
      renderStoreOverlaysRef.current(filteredStoresRef.current, mapFocusHighlightRef.current);
      return;
    }

    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(roadCoordsRef.current.center.lat, roadCoordsRef.current.center.lng),
      level: 4,
    });
    mapInstanceRef.current = map;
    setMapLoaded(true);

    // 줌/이동 시 항상 최신 renderStoreOverlays 호출 (구버전 클로저면 세부 핀이 안 그려짐)
    zoomListenerRef.current = () =>
      renderStoreOverlaysRef.current(filteredStoresRef.current, mapFocusHighlightRef.current);
    dragListenerRef.current = () =>
      renderStoreOverlaysRef.current(filteredStoresRef.current, mapFocusHighlightRef.current);
    kakao.maps.event.addListener(map, "zoom_changed", zoomListenerRef.current);
    kakao.maps.event.addListener(map, "dragend", dragListenerRef.current);
    listenersCleanupRef.current = () => {
      if (zoomListenerRef.current) kakao.maps.event.removeListener(map, "zoom_changed", zoomListenerRef.current);
      if (dragListenerRef.current) kakao.maps.event.removeListener(map, "dragend", dragListenerRef.current);
      zoomListenerRef.current = null;
      dragListenerRef.current = null;
    };

    if (kakao.maps.services?.Geocoder) {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(ROAD_START_ADDRESS, (startResult: Array<{ y: string; x: string }>, startStatus: string) => {
        if (startStatus === kakao.maps.services.Status.OK) {
          const start = { lat: Number(startResult[0].y), lng: Number(startResult[0].x) };
          const end = PALMIDO_CRUISE_ANCHOR;
          const center = { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 };
          roadCoordsRef.current = { start, end, center };
          eventPlazaPositionRef.current = {
            lat: (start.lat + center.lat) / 2 + 0.00028,
            lng: (start.lng + center.lng) / 2 + 0.00014,
          };
          map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
          if (kakao.maps.services?.Places) {
            const places = new kakao.maps.services.Places();
            const around = new kakao.maps.LatLng(center.lat, center.lng);
            const searchOptions = { location: around, radius: 8000 };
            ferryTerminalPositionRef.current = {
              lat: end.lat + 0.00095,
              lng: end.lng - 0.00115,
            };
            places.keywordSearch(
              EVENT_PLAZA_PLACES_QUERY,
              (plazaPlaces: Array<{ y: string; x: string }>, plazaStatus: string) => {
                if (plazaStatus === kakao.maps.services.Status.OK && plazaPlaces?.[0]) {
                  eventPlazaPositionRef.current = {
                    lat: Number(plazaPlaces[0].y),
                    lng: Number(plazaPlaces[0].x),
                  };
                }
                places.keywordSearch(
                  FERRY_TERMINAL_PLACES_QUERY,
                  (ferryPlaces: Array<{ y: string; x: string }>, ferryStatus: string) => {
                    if (ferryStatus === kakao.maps.services.Status.OK && ferryPlaces?.[0]) {
                      ferryTerminalPositionRef.current = {
                        lat: Number(ferryPlaces[0].y),
                        lng: Number(ferryPlaces[0].x),
                      };
                    }
                    applyPendingMapFocus();
                    renderStoreOverlaysRef.current(filteredStoresRef.current, mapFocusHighlightRef.current);
                  },
                  searchOptions
                );
              },
              searchOptions
            );
          } else {
            ferryTerminalPositionRef.current = { ...FALLBACK_FERRY_TERMINAL };
            applyPendingMapFocus();
            renderStoreOverlaysRef.current(filteredStoresRef.current, mapFocusHighlightRef.current);
          }
          return;
        }
        setMapError("주소 좌표 변환에 실패해 기본 좌표를 사용합니다.");
      });

      if (kakao.maps.services?.Places) {
        const places = new kakao.maps.services.Places();
        const around = new kakao.maps.LatLng(roadCoordsRef.current.center.lat, roadCoordsRef.current.center.lng);
        const searchOptions = { location: around, radius: 3500 };
        places.keywordSearch(
          DETAIL_CORRIDOR_START_KEYWORD,
          (startPlaces: Array<{ y: string; x: string }>, startPlaceStatus: string) => {
            places.keywordSearch(
              DETAIL_CORRIDOR_END_KEYWORD,
              (endPlaces: Array<{ y: string; x: string }>, endPlaceStatus: string) => {
                if (startPlaceStatus === kakao.maps.services.Status.OK && endPlaceStatus === kakao.maps.services.Status.OK) {
                  detailCorridorRef.current = {
                    start: { lat: Number(startPlaces[0].y), lng: Number(startPlaces[0].x) },
                    end: { lat: Number(endPlaces[0].y), lng: Number(endPlaces[0].x) },
                  };
                  keywordAnchorRef.current.ongjin = detailCorridorRef.current.start;
                  places.keywordSearch(
                    PANCAKE_ANCHOR_KEYWORD,
                    (pancakePlaces: Array<{ y: string; x: string }>, pancakeStatus: string) => {
                      if (pancakeStatus === kakao.maps.services.Status.OK) {
                        keywordAnchorRef.current.pancake = {
                          lat: Number(pancakePlaces[0].y),
                          lng: Number(pancakePlaces[0].x),
                        };
                      }
                      renderStoreOverlaysRef.current(filteredStoresRef.current, mapFocusHighlightRef.current);
                    },
                    searchOptions
                  );
                  return;
                }
                setMapError("상세 핀 도로 좌표 검색 실패: 키워드 결과를 찾지 못했습니다.");
              },
              searchOptions
            );
          },
          searchOptions
        );
      }
    }

    renderStoreOverlaysRef.current(filteredStoresRef.current, mapFocusHighlightRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 리스너는 renderStoreOverlaysRef로 최신 함수 참조
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_KAKAO_MAPS_API_KEY as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).kakao?.maps) {
      initMap();
      return;
    }
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kakao = (window as any).kakao;
      console.log("[KakaoMap] script onload fired, window.kakao =", kakao);
      if (!kakao?.maps) {
        console.error("[KakaoMap] kakao.maps not found — API key or domain may be rejected");
        setMapError("카카오맵 API 키 또는 도메인 설정을 확인해주세요.\n(developers.kakao.com → 플랫폼 → http://localhost:5173 등록)");
        return;
      }
      kakao.maps.load(initMap);
    };
    script.onerror = () => {
      console.error("[KakaoMap] script failed to load (network/403)");
      setMapError("카카오맵 스크립트 로드 실패. API 키와 네트워크를 확인해주세요.");
    };
    document.head.appendChild(script);
  }, [initMap]);

  useEffect(() => {
    if (!mapLoaded || diningSurface !== "map") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    if (!kakao?.maps || !map) return;

    const skipRoadCenterOnce = suppressRoadCenterOnceRef.current;
    suppressRoadCenterOnceRef.current = false;

    /** 세부 핀 줌(레벨 ≤ 세부 고정 레벨)에서는 필터 변경 시 줌·중심 유지하고 마커만 다시 그림 */
    const level =
      typeof map.getLevel === "function" ? (map.getLevel() as number) : 4;
    if (!(sheetMode === "detail" && selectedStore)) {
      if (level > DETAIL_ONLY_ZOOM_LEVEL && !skipRoadCenterOnce) {
        map.setCenter(new kakao.maps.LatLng(roadCoordsRef.current.center.lat, roadCoordsRef.current.center.lng));
      }
    }
    renderStoreOverlays(filteredStoresRef.current, mapFocusHighlightRef.current);
  }, [
    filteredStores,
    mapLoaded,
    renderStoreOverlays,
    mapFocusHighlightId,
    diningSurface,
    sheetMode,
    selectedStore?.id,
  ]);

  /** 바텀시트 높이만큼 남는 영역 위쪽에 핀이 오도록 픽셀 보정 pan */
  const panPinAboveBottomSheet = useCallback(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    const mapEl = mapRef.current;
    if (!kakao?.maps || !map?.getProjection || !mapEl || !selectedStore) return;

    const pos = computeStoreMapFocusLatLng(selectedStore);
    const latLng = new kakao.maps.LatLng(pos.lat, pos.lng);
    const proj = map.getProjection();
    const cpt = proj.containerPointFromCoords(latLng);
    const rect = mapEl.getBoundingClientRect();

    const vh = window.innerHeight / 100;
    let sheetH: number;
    if (sheetMode === "list") {
      sheetH = Math.min(54 * vh, window.innerHeight * 0.85);
    } else if (detailExpanded) {
      sheetH = Math.min(92 * vh, window.innerHeight - 16);
    } else {
      sheetH = Math.min(56 * vh, window.innerHeight * 0.78);
    }

    const sheetTopY = window.innerHeight - sheetH;
    const pinViewportY = rect.top + cpt.y;
    const desiredY = sheetTopY - Math.min(80, rect.height * 0.12);
    const dy = pinViewportY - desiredY;
    if (Math.abs(dy) > 2) map.panBy(0, dy);
  }, [computeStoreMapFocusLatLng, detailExpanded, selectedStore, sheetMode]);

  useLayoutEffect(() => {
    if (!mapLoaded || diningSurface !== "map" || sheetMode !== "detail" || !selectedStore) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    if (!kakao?.maps || !map) return;
    const pos = computeStoreMapFocusLatLng(selectedStore);
    map.setLevel(DETAIL_ONLY_ZOOM_LEVEL);
    map.panTo(new kakao.maps.LatLng(pos.lat, pos.lng));
    const id = window.setTimeout(() => {
      map.relayout?.();
      renderStoreOverlays(filteredStoresRef.current, mapFocusHighlightRef.current);
      panPinAboveBottomSheet();
    }, 100);
    return () => window.clearTimeout(id);
  }, [
    mapLoaded,
    diningSurface,
    sheetMode,
    selectedStore?.id,
    detailExpanded,
    computeStoreMapFocusLatLng,
    renderStoreOverlays,
    panPinAboveBottomSheet,
  ]);

  useEffect(() => {
    if (!mapLoaded || diningSurface !== "map" || sheetMode !== "detail" || !selectedStore) return;
    const id = window.setTimeout(() => panPinAboveBottomSheet(), 140);
    return () => window.clearTimeout(id);
  }, [
    detailExpanded,
    mapLoaded,
    diningSurface,
    sheetMode,
    selectedStore?.id,
    panPinAboveBottomSheet,
  ]);

  useEffect(
    () => () => {
      clearOverlays();
      listenersCleanupRef.current?.();
    },
    [clearOverlays]
  );

  // ── 선택된 가게 큐/스탬프 상태 ────────────────────
  const ticket      = selectedStore ? ticketFor(selectedStore.id) : undefined;
  const isQueued    = !!ticket;
  const selectedWaitStyle = selectedStore ? styleForCategory(selectedStore.waitTime) : null;

  const handleQueue = () => {
    if (!user) { window.alert("로그인 후 이용 가능합니다."); return; }
    if (!selectedStore || isQueued) return;
    joinQueue(selectedStore.id, {
      queueNumber: selectedStore.queueCount + 1,
      peopleAhead: selectedStore.queueCount,
      etaMinutes:  selectedStore.waitTime,
    });
  };

  const openFilterModal = useCallback(() => {
    setSortMenuOpen(false);
    setDraftWait(appliedWait);
    setDraftRating(appliedRating);
    setFilterModalOpen(true);
  }, [appliedWait, appliedRating]);

  const applyFilterModal = useCallback(() => {
    setAppliedWait(draftWait);
    setAppliedRating(draftRating);
    setFilterModalOpen(false);
  }, [draftWait, draftRating]);

  const resetFilterDraft = useCallback(() => {
    setDraftWait("all");
    setDraftRating("all");
  }, []);

  const closeSheetCompletely = useCallback(() => {
    const snap = mapViewportSnapshotRef.current;
    mapViewportSnapshotRef.current = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = typeof window !== "undefined" ? (window as any).kakao : undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    if (snap && kakao?.maps && map?.setCenter && map?.setLevel) {
      suppressRoadCenterOnceRef.current = true;
      map.setLevel(snap.level);
      map.setCenter(new kakao.maps.LatLng(snap.lat, snap.lng));
      window.setTimeout(() => {
        map.relayout?.();
        renderStoreOverlaysRef.current(filteredStoresRef.current, mapFocusHighlightRef.current);
      }, 80);
    }

    setSelectedStore(null);
    setActiveCategoryLabel(null);
    setSheetMode(null);
    setDetailExpanded(false);
    setAppliedWait("all");
    setAppliedRating("all");
    setDraftWait("all");
    setDraftRating("all");
    setListCouponOnly(false);
    setListSort("wait");
    setSortChoiceExplicit(false);
    setListSortTick(0);
    setSortMenuOpen(false);
    setFilterModalOpen(false);
    setReviewMenuModalOpen(false);
  }, []);

  const openReviewMenuModal = useCallback(() => {
    setReviewMenuDraft([...reviewAppliedMenus]);
    setReviewMenuModalOpen(true);
  }, [reviewAppliedMenus]);

  const applyReviewMenuModal = useCallback(() => {
    setReviewAppliedMenus([...reviewMenuDraft]);
    setReviewMenuModalOpen(false);
    setReviewsExpanded(false);
  }, [reviewMenuDraft]);

  const toggleReviewMenuDraft = useCallback((name: string) => {
    setReviewMenuDraft((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));
  }, []);

  const allReviewsSorted = useMemo(() => {
    if (!selectedStore) return [];
    return [...selectedStore.reviews].sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedStore]);

  const reviewsSource = useMemo(() => {
    if (!selectedStore) return [];
    if (reviewAppliedMenus.length === 0) return allReviewsSorted;
    const pick = new Set(reviewAppliedMenus);
    return allReviewsSorted.filter((r) => pick.has(r.menuItem));
  }, [selectedStore, allReviewsSorted, reviewAppliedMenus]);

  const reviewMenuPreviewCount = useMemo(() => {
    if (!selectedStore) return 0;
    if (reviewMenuDraft.length === 0) return selectedStore.reviews.length;
    const pick = new Set(reviewMenuDraft);
    return selectedStore.reviews.filter((r) => pick.has(r.menuItem)).length;
  }, [selectedStore, reviewMenuDraft]);

  const visibleReviews = reviewsExpanded ? reviewsSource : reviewsSource.slice(0, 5);

  return (
    <div className="relative flex flex-1 flex-col min-h-0 bg-background">
      <TopUtilityBar />

      <div className="shrink-0 space-y-g2 border-b border-border px-g4 pb-g2 pt-g2">
        <div className="flex items-center gap-g2">
          <div className="inline-flex rounded-full bg-muted/90 p-0.5">
            <button
              type="button"
              onClick={() => setDiningSurface("map")}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold leading-none transition sm:px-g2 sm:text-xs",
                diningSurface === "map"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MapIcon className="h-3.5 w-3.5 shrink-0" />
              {primary("지도", "Map")}
            </button>
            <button
              type="button"
              onClick={() => setDiningSurface("list")}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold leading-none transition sm:px-g2 sm:text-xs",
                diningSurface === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutList className="h-3.5 w-3.5 shrink-0" />
              {primary("목록", "List")}
            </button>
          </div>
          <div className="min-w-0 flex-1" />
          {diningSurface === "list" && (
            <div ref={sortWrapRef} className="relative shrink-0">
              <button
                type="button"
                className="inline-flex h-7 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-pill border border-border bg-card px-2.5 text-[11px] font-medium text-foreground sm:px-g2 sm:text-xs"
                onClick={() => setSortMenuOpen((o) => !o)}
              >
                {!sortChoiceExplicit
                  ? primary("정렬", "Sort")
                  : listSort === "popular"
                    ? primary("추천", "Recommended")
                    : primary("최소 대기순", "Shortest wait")}
                <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition", sortMenuOpen && "rotate-180")} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-g2 overflow-x-auto pb-1 no-scrollbar">
          {typeFilters.map((f) => (
            <FilterChip key={f.id} active={activeFilter === f.id} onClick={() => setActiveFilter(f.id)}>
              {primary(f.ko, f.en)}
            </FilterChip>
          ))}
          {diningSurface === "list" && (
            <button
              type="button"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground"
              aria-label={primary("필터", "Filter")}
              onClick={openFilterModal}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={mapRef}
          className={cn("absolute inset-0", diningSurface === "list" && "pointer-events-none invisible z-0")}
        />

        {diningSurface === "map" && !mapLoaded && (
          <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-g3 bg-secondary px-g6 text-center">
            {mapError ? (
              <>
                <p className="type-body font-semibold text-destructive">지도 로드 실패</p>
                <p className="type-caption whitespace-pre-line text-muted-foreground">{mapError}</p>
              </>
            ) : (
              <p className="type-body text-muted-foreground">지도 불러오는 중…</p>
            )}
          </div>
        )}

        {diningSurface === "list" && (
          <div className="absolute inset-0 z-20 flex min-h-0 flex-col bg-background">
            <p className="shrink-0 px-g4 pb-g2 pt-g1 type-caption text-muted-foreground">
              {primary(`${browseListStores.length}개 상점`, `${browseListStores.length} stores`)}
            </p>
            <div className="min-h-0 flex-1 space-y-g3 overflow-y-auto px-g4 pb-g8 pt-g1">
              {browseListStores.length === 0 ? (
                <p className="type-caption py-g6 text-center text-muted-foreground">
                  {primary("조건에 맞는 가게가 없어요.", "No stores match filters.")}
                </p>
              ) : (
                browseListStores.map((store) => {
                  const vs = vendorStatusTone(store, primary);
                  const savedHere = isSaved(store.id);
                  const openBrowseDetail = () => {
                    setListDetailOpenedFromWaiting(false);
                    setListDetailReturnTo(null);
                    setSelectedStore(store);
                    setActiveCategoryLabel(categoryForStore(store)?.label ?? null);
                    setReviewAppliedMenus([]);
                    setReviewMenuDraft([]);
                    setReviewMenuModalOpen(false);
                    setMenuExpanded(false);
                    setReviewsExpanded(false);
                    setDetailExpanded(false);
                    setListDetailOpen(true);
                  };
                  return (
                    <div
                      key={store.id}
                      className="flex w-full cursor-pointer flex-col gap-0 rounded-card border border-border bg-card p-g3 shadow-elevate-sm"
                      role="button"
                      tabIndex={0}
                      onClick={openBrowseDetail}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          openBrowseDetail();
                        }
                      }}
                    >
                      <div className="flex w-full items-start gap-3">
                        <img
                          src={storePhotosById[store.id]?.[0]}
                          alt=""
                          className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="min-w-0 flex-1 type-body font-bold leading-tight text-foreground">
                              {primary(store.name, store.nameEn)}
                              <span className="font-semibold text-muted-foreground"> · </span>
                              <span className="type-caption font-medium text-muted-foreground">
                                {primary(store.category, store.categoryEn)}
                              </span>
                            </p>
                            <button
                              type="button"
                              className="shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-secondary hover:text-brand-coral"
                              aria-label={primary(
                                savedHere ? "저장 취소" : "상점 저장",
                                savedHere ? "Remove from saved" : "Save vendor",
                              )}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                toggleSaved(store.id);
                              }}
                            >
                              <Heart
                                className={cn("h-3.5 w-3.5", savedHere && "fill-brand-coral text-brand-coral")}
                                strokeWidth={2}
                              />
                            </button>
                          </div>
                          <div className="mt-g2 flex flex-wrap items-center gap-x-g3 gap-y-1 type-caption text-muted-foreground">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 font-semibold tabular-nums",
                                waitTimeColorClass(store.waitTime)
                              )}
                            >
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              {store.waitTime}
                              {primary("분", "m")}
                            </span>
                            <span className="inline-flex items-center gap-1 font-medium tabular-nums text-foreground">
                              <Users className="h-3.5 w-3.5 shrink-0" />
                              {primary(`${store.queueCount}명`, `${store.queueCount}`)}
                            </span>
                            {(() => {
                              const stock = getBakeryStock(store);
                              if (stock == null) return null;
                              return (
                                <span className={cn(
                                  "inline-flex items-center gap-1 font-semibold tabular-nums",
                                  stock > 20 ? "text-emerald-600" : stock > 0 ? "text-amber-600" : "text-destructive"
                                )}>
                                  🥐 {stock > 0 ? primary(`${stock}개 남음`, `${stock} left`) : primary("품절", "Sold out")}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="mt-g2 flex min-w-0 flex-wrap items-center gap-x-g2 gap-y-0.5 type-caption">
                            <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-foreground">
                              <Star className="h-3.5 w-3.5 fill-brand-royal text-brand-royal" />
                              {store.rating.toFixed(1)}
                            </span>
                            <span className="min-w-0 truncate text-muted-foreground">
                              {primary(store.hours.ko, store.hours.en)}
                            </span>
                            <span className={cn("shrink-0 font-semibold", vs.className)}>{vs.text}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 목록 매장 상세: 유틸바·지도|목록·필터 칩까지 덮음 (하단 앱 탭바만 유지) */}
      {diningSurface === "list" && listDetailOpen && selectedStore && (
        <div className="absolute inset-0 z-[70] flex min-h-0 flex-col bg-background">
          <div className="flex min-h-0 flex-1 flex-col">
            <DiningStoreDetailScroll
              variant="listPage"
              store={selectedStore}
              onBack={() => {
                const returnPath = listDetailReturnTo;
                const backToWaiting = listDetailOpenedFromWaiting;
                setListDetailReturnTo(null);
                setListDetailOpenedFromWaiting(false);
                setListDetailOpen(false);
                setSelectedStore(null);
                setActiveCategoryLabel(null);
                setReviewAppliedMenus([]);
                setReviewMenuDraft([]);
                setReviewMenuModalOpen(false);
                setMenuExpanded(false);
                setReviewsExpanded(false);
                if (returnPath) {
                  navigate(returnPath);
                  return;
                }
                if (backToWaiting) {
                  navigate("/waiting");
                }
              }}
              backLabelKo="돌아가기"
              backLabelEn="Back"
              primary={primary}
              formatStoreAddress={formatStoreAddress}
              storePhotosById={storePhotosById}
              selectedWaitStyle={selectedWaitStyle}
              ticket={ticket}
              menuExpanded={menuExpanded}
              onMenuExpandedToggle={() => setMenuExpanded((v) => !v)}
              reviewsExpanded={reviewsExpanded}
              onReviewsExpandedToggle={() => setReviewsExpanded((v) => !v)}
              visibleReviews={visibleReviews}
              reviewsSource={reviewsSource}
              reviewAppliedMenus={reviewAppliedMenus}
              onOpenReviewMenu={() => {
                setSortMenuOpen(false);
                openReviewMenuModal();
              }}
              detailExpanded={false}
              queueFooterInline
              onQueueJoin={handleQueue}
              onQueueLeave={() => leaveQueue(selectedStore.id)}
              isGuest={!user}
              saved={isSaved(selectedStore.id)}
              onToggleSaved={() => toggleSaved(selectedStore.id)}
            />
          </div>
        </div>
      )}

      {/* ── 바텀시트 (딤 + 닫기) ───────────────── */}
      {sheetMode && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label={primary("닫기", "Close")}
            onClick={closeSheetCompletely}
          />
          <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-frame flex-col justify-end">
          <div
            className={cn(
              "flex min-h-0 flex-col overflow-hidden rounded-t-sheet border border-border bg-card shadow-[0_-12px_48px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-200",
              sheetMode === "list"
                ? "h-[min(54vh,85dvh)]"
                : detailExpanded
                  ? "h-[min(92vh,calc(100dvh-1rem))]"
                  : "h-[min(56vh,78dvh)]"
            )}
          >
            <div className="relative flex shrink-0 justify-center border-b border-border/60 pt-g3 pb-g2">
              <span className="h-1 w-10 rounded-pill bg-border" />
              <button
                type="button"
                className="absolute right-g3 top-2 rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                onClick={closeSheetCompletely}
                aria-label={primary("닫기", "Close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {sheetMode === "list" && activeCategory && (
              <div ref={listScrollRef} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="space-y-g3 shrink-0 border-b border-border px-g4 pb-g3">
                  <div className="flex items-center gap-g2">
                    <span className="text-2xl">{activeCategory.emoji}</span>
                    <h3 className="type-title">{primary(activeCategory.label, activeCategory.labelEn)}</h3>
                  </div>
                  <div className="flex items-center gap-g2 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground"
                      aria-label={primary("필터", "Filter")}
                      onClick={openFilterModal}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </button>
                    <div ref={sortWrapRef} className="relative shrink-0">
                      <button
                        type="button"
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-pill border border-border bg-card px-g3 type-caption font-medium text-foreground"
                        onClick={() => setSortMenuOpen((o) => !o)}
                      >
                        {!sortChoiceExplicit
                          ? primary("정렬", "Sort")
                          : listSort === "popular"
                            ? diningSurface === "list"
                              ? primary("추천", "Recommended")
                              : primary("인기순", "Popular")
                            : primary("최소 대기순", "Shortest wait")}
                        <ChevronDown className={cn("h-4 w-4 shrink-0 transition", sortMenuOpen && "rotate-180")} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setListCouponOnly((v) => !v)}
                      className={cn(
                        "shrink-0 rounded-pill border px-g3 py-g2 type-caption font-semibold transition",
                        listCouponOnly
                          ? "border-brand-royal bg-brand-royal text-white shadow-elevate-sm"
                          : "border-border bg-card text-foreground hover:border-brand-royal/40"
                      )}
                    >
                      {primary("내 쿠폰", "My coupon")}
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 space-y-g3 overflow-y-auto px-g4 pb-g8 pt-g3">
                  {filteredCategoryStores.length === 0 ? (
                    <p className="type-caption text-muted-foreground text-center py-g6">
                      {primary("조건에 맞는 가게가 없어요.", "No stores match filters.")}
                    </p>
                  ) : (
                    filteredCategoryStores.map((store) => {
                      const vs = vendorStatusTone(store, primary);
                      const savedHere = isSaved(store.id);
                      const openSheetRow = () => {
                        captureMapViewportSnapshot();
                        setSelectedStore(store);
                        setActiveCategoryLabel(categoryForStore(store)?.label ?? null);
                        setReviewAppliedMenus([]);
                        setReviewMenuDraft([]);
                        setReviewMenuModalOpen(false);
                        setMenuExpanded(false);
                        setReviewsExpanded(false);
                        setSheetMode("detail");
                        setDetailExpanded(false);
                      };
                      return (
                        <div
                          key={store.id}
                          className="flex w-full cursor-pointer flex-col gap-0 rounded-card border border-border bg-card p-g3"
                          role="button"
                          tabIndex={0}
                          onClick={openSheetRow}
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter" || ev.key === " ") {
                              ev.preventDefault();
                              openSheetRow();
                            }
                          }}
                        >
                          <div className="flex w-full items-start gap-g3">
                            <img
                              src={storePhotosById[store.id]?.[0]}
                              alt={store.name}
                              className="h-16 w-16 shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="min-w-0 flex-1 type-body font-semibold leading-tight text-foreground">
                                  {primary(store.name, store.nameEn)}
                                </p>
                                <button
                                  type="button"
                                  className="shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-secondary hover:text-brand-coral"
                                  aria-label={primary(
                                    savedHere ? "저장 취소" : "상점 저장",
                                    savedHere ? "Remove from saved" : "Save vendor",
                                  )}
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    toggleSaved(store.id);
                                  }}
                                >
                                  <Heart
                                    className={cn("h-3.5 w-3.5", savedHere && "fill-brand-coral text-brand-coral")}
                                    strokeWidth={2}
                                  />
                                </button>
                              </div>
                              <p className="type-caption text-muted-foreground truncate">
                                {formatStoreAddress(store, primary)}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-g3 gap-y-0.5 type-caption text-muted-foreground">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 font-semibold tabular-nums",
                                    waitTimeColorClass(store.waitTime)
                                  )}
                                >
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  {store.waitTime}
                                  {primary("분", "m")}
                                </span>
                                <span className="inline-flex items-center gap-1 font-medium tabular-nums text-foreground">
                                  <Users className="h-3.5 w-3.5 shrink-0" />
                                  {primary(`${store.queueCount}명`, `${store.queueCount}`)}
                                </span>
                                {(() => {
                                  const stock = getBakeryStock(store);
                                  if (stock == null) return null;
                                  return (
                                    <span className={cn(
                                      "inline-flex items-center gap-1 font-semibold tabular-nums",
                                      stock > 20 ? "text-emerald-600" : stock > 0 ? "text-amber-600" : "text-destructive"
                                    )}>
                                      🥐 {stock > 0 ? primary(`${stock}개 남음`, `${stock} left`) : primary("품절", "Sold out")}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-g2 gap-y-0.5 type-caption">
                                <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-foreground">
                                  <Star className="h-3.5 w-3.5 fill-brand-royal text-brand-royal" />
                                  {store.rating.toFixed(1)}
                                </span>
                                <span className="min-w-0 truncate text-muted-foreground">
                                  {primary(store.hours.ko, store.hours.en)}
                                </span>
                                <span className={cn("shrink-0 font-semibold", vs.className)}>{vs.text}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {sheetMode === "detail" && selectedStore && (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <DiningStoreDetailScroll
                  variant="sheet"
                  scrollRef={detailScrollRef}
                  onScroll={(e) => {
                    if (!detailExpanded) {
                      const target = e.currentTarget;
                      if (target.scrollTop > 64) setDetailExpanded(true);
                    }
                  }}
                  store={selectedStore}
                  onBack={() => {
                    if (!activeCategoryLabel && selectedStore) {
                      setActiveCategoryLabel(categoryForStore(selectedStore)?.label ?? null);
                    }
                    setDetailExpanded(false);
                    setSheetMode("list");
                  }}
                  backLabelKo="목록으로"
                  backLabelEn="Back"
                  primary={primary}
                  formatStoreAddress={formatStoreAddress}
                  storePhotosById={storePhotosById}
                  selectedWaitStyle={selectedWaitStyle}
                  ticket={ticket}
                  menuExpanded={menuExpanded}
                  onMenuExpandedToggle={() => setMenuExpanded((v) => !v)}
                  reviewsExpanded={reviewsExpanded}
                  onReviewsExpandedToggle={() => setReviewsExpanded((v) => !v)}
                  visibleReviews={visibleReviews}
                  reviewsSource={reviewsSource}
                  reviewAppliedMenus={reviewAppliedMenus}
                  onOpenReviewMenu={() => {
                    setSortMenuOpen(false);
                    openReviewMenuModal();
                  }}
                  detailExpanded={detailExpanded}
                  queueFooterInline={false}
                  onQueueJoin={handleQueue}
                  onQueueLeave={() => leaveQueue(selectedStore.id)}
                  isGuest={!user}
                  saved={isSaved(selectedStore.id)}
                  onToggleSaved={() => toggleSaved(selectedStore.id)}
                />
                {detailExpanded && (
                  <div className="shrink-0 border-t border-border bg-card px-g4 py-g3 shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
                    {ticket ? (
                      <div className="rounded-card border border-border bg-card px-g3 py-g2 shadow-elevate-sm">
                        <div className="flex items-center justify-center gap-g2 text-brand-royal">
                          <Ticket className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                          <span className="type-title font-bold tabular-nums">#{ticket.queueNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => leaveQueue(selectedStore.id)}
                          className="type-caption mt-g2 w-full font-semibold text-brand-royal underline"
                        >
                          {primary("대기 취소 · Cancel", "Cancel reservation")}
                        </button>
                      </div>
                    ) : user ? (
                      <AppButton variant="primary" onClick={handleQueue} className="w-full">
                        {primary("예약하기", "Reserve")}
                      </AppButton>
                    ) : (
                      <p className="type-caption text-center text-muted-foreground py-g2">
                        로그인 후 줄서기 기능을 이용해보세요
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      )}

      {sortMenuOpen &&
        sortMenuPos &&
        createPortal(
          <div
            id="dining-sort-portal"
            className="fixed z-[200] rounded-card border border-border bg-card py-1 shadow-elevate-lg"
            style={{
              top: sortMenuPos.top,
              left: sortMenuPos.left,
              minWidth: sortMenuPos.minWidth,
            }}
          >
            <button
              type="button"
              className="w-full px-g3 py-g2 text-left type-caption hover:bg-secondary"
              onClick={() => {
                setListSort("popular");
                setSortChoiceExplicit(true);
                setListSortTick((t) => t + 1);
                setSortMenuOpen(false);
              }}
            >
              {diningSurface === "list" ? primary("추천", "Recommended") : primary("인기순", "Popular")}
            </button>
            <button
              type="button"
              className="w-full px-g3 py-g2 text-left type-caption hover:bg-secondary"
              onClick={() => {
                setListSort("wait");
                setSortChoiceExplicit(true);
                setListSortTick((t) => t + 1);
                setSortMenuOpen(false);
              }}
            >
              {primary("최소 대기순", "Shortest wait")}
            </button>
          </div>,
          document.body
        )}

      {filterModalOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 z-0 bg-black/45"
            onClick={() => setFilterModalOpen(false)}
            aria-label={primary("닫기", "Close")}
          />
          <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center sm:items-center sm:px-g4">
            <div className="pointer-events-auto flex max-h-[min(78vh,100dvh-2rem)] w-full max-w-frame flex-col overflow-hidden rounded-t-sheet border-t border-border bg-card shadow-elevate-lg sm:mb-[10vh] sm:max-w-md sm:rounded-2xl sm:border">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-g4 py-g3">
              <h3 className="type-title font-bold text-foreground">{primary("필터", "Filter")}</h3>
              <button
                type="button"
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setFilterModalOpen(false)}
                aria-label={primary("닫기", "Close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-g5 overflow-y-auto px-g4 py-g4">
              <div>
                <p className="type-caption mb-g2 font-medium text-muted-foreground">
                  {primary("대기 시간", "Wait time")}
                </p>
                <div className="flex flex-wrap gap-g2">
                  {(
                    [
                      { id: "all" as const, ko: "대기 전체", en: "All waits" },
                      { id: "u10" as const, ko: "10분 미만", en: "Under 10 min" },
                      { id: "u20" as const, ko: "20분 미만", en: "Under 20 min" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDraftWait(opt.id)}
                      className={cn(
                        "rounded-pill border px-g4 py-g2 type-caption font-medium transition",
                        draftWait === opt.id
                          ? "border-brand-royal bg-brand-royal text-white shadow-elevate-sm"
                          : "border-border bg-card text-foreground hover:border-brand-royal/40"
                      )}
                    >
                      {primary(opt.ko, opt.en)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="type-caption mb-g2 font-medium text-muted-foreground">
                  {primary("별점", "Rating")}
                </p>
                <div className="flex flex-wrap gap-g2">
                  {(
                    [
                      { id: "all" as const, ko: "전체", en: "All" },
                      { id: "r35" as const, ko: "3.5 이상", en: "3.5+" },
                      { id: "r40" as const, ko: "4 이상", en: "4.0+" },
                      { id: "r45" as const, ko: "4.5 이상", en: "4.5+" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDraftRating(opt.id)}
                      className={cn(
                        "rounded-pill border px-g4 py-g2 type-caption font-medium transition",
                        draftRating === opt.id
                          ? "border-brand-royal bg-brand-royal text-white shadow-elevate-sm"
                          : "border-border bg-card text-foreground hover:border-brand-royal/40"
                      )}
                    >
                      {primary(opt.ko, opt.en)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-g3 border-t border-border bg-card px-g4 py-g3">
              <button
                type="button"
                className="type-body font-semibold text-brand-royal"
                onClick={resetFilterDraft}
              >
                {primary("초기화", "Reset")}
              </button>
              <AppButton variant="primary" className="min-h-11 flex-1" onClick={applyFilterModal}>
                {primary(`${filterPreviewCount}개 보기`, `Show ${filterPreviewCount}`)}
              </AppButton>
            </div>
            </div>
          </div>
        </div>
      )}

      {reviewMenuModalOpen &&
        selectedStore &&
        createPortal(
          <div className="fixed inset-0 z-[210]">
            <button
              type="button"
              className="absolute inset-0 z-0 bg-black/45"
              onClick={() => setReviewMenuModalOpen(false)}
              aria-label={primary("닫기", "Close")}
            />
            <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center sm:items-center sm:px-g4">
              <div className="pointer-events-auto flex max-h-[min(78vh,100dvh-2rem)] w-full max-w-frame flex-col overflow-hidden rounded-t-sheet border-t border-border bg-card shadow-elevate-lg sm:mb-[10vh] sm:max-w-md sm:rounded-2xl sm:border">
              <div className="flex shrink-0 justify-end border-b border-border px-g3 py-g2">
                <button
                  type="button"
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => setReviewMenuModalOpen(false)}
                  aria-label={primary("닫기", "Close")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-g4 py-g4">
                <div className="grid grid-cols-2 gap-x-g4 gap-y-g3">
                  {selectedStore.menu.map((m) => (
                    <label
                      key={m.name}
                      className="flex cursor-pointer items-start gap-g2 rounded-lg p-g1 hover:bg-secondary/50"
                    >
                      <input
                        type="checkbox"
                        checked={reviewMenuDraft.includes(m.name)}
                        onChange={() => toggleReviewMenuDraft(m.name)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-brand-royal focus:ring-2 focus:ring-brand-royal/30"
                      />
                      <span className="type-caption leading-snug text-foreground">{primary(m.name, m.nameEn)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="shrink-0 border-t border-border px-g3 py-g2">
                <button
                  type="button"
                  className="w-full rounded-lg bg-foreground px-g3 py-g2 type-caption font-semibold text-background transition hover:opacity-90 active:scale-[0.99]"
                  onClick={applyReviewMenuModal}
                >
                  {primary(`${reviewMenuPreviewCount}개의 후기 보기`, `View ${reviewMenuPreviewCount} reviews`)}
                </button>
              </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
