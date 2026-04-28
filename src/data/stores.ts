export type CrowdLevel = "low" | "moderate" | "busy";
import { getNowInKst } from "@/lib/timeKst";

export type VendorStatus = "open" | "pre_open" | "closed" | "sold_out";
export type StoreType = "food_court" | "food_truck" | "restaurant";

export interface MenuItem {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  spicy?: boolean;
  signature?: boolean;
  soldOut?: boolean;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  commentEn: string;
  menuItem: string;
  date: string;
}

export interface Store {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  storeType: StoreType;
  emoji: string;
  /** 한줄 소개 (DB: tagline) */
  tagline?: { ko: string; en: string };
  description: string;
  descriptionEn: string;
  hours: { ko: string; en: string };
  rating: number;
  waitTime: number;
  lat: number;
  lng: number;
  x: number;
  y: number;
  menu: MenuItem[];
  reviews: Review[];
  queueCount: number;
  crowdLevel?: CrowdLevel;
  vendorStatus?: VendorStatus;
  vibeTags?: string[];
  vibeTagsEn?: string[];
  hasReward?: boolean;
  hasCoupon?: boolean;
  /** 층 표기 (예: B1, 2F) — 주소와 함께 표시 */
  floorLabel?: { ko: string; en: string };
}

export function inferCrowdLevel(s: Store): CrowdLevel {
  if (s.crowdLevel) return s.crowdLevel;
  if (s.waitTime <= 8) return "low";
  if (s.waitTime <= 16) return "moderate";
  return "busy";
}

export function waitTimeColorClass(minutes: number): string {
  if (minutes <= 8) return "text-brand-green";
  if (minutes <= 16) return "text-brand-yellow";
  return "text-brand-coral";
}

function parseKoHoursRange(ko: string): { startMin: number; endMin: number } | null {
  const m = ko.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const sh = Number(m[1]);
  const sm = Number(m[2]);
  const eh = Number(m[3]);
  const em = Number(m[4]);
  if ([sh, sm, eh, em].some(Number.isNaN)) return null;
  const startMin = sh * 60 + sm;
  const endMin = (eh === 24 ? 24 * 60 : eh * 60) + em;
  return { startMin, endMin };
}

export function getVendorStatus(s: Store, nowKst: Date = getNowInKst()): VendorStatus {
  if (s.vendorStatus === "sold_out") return "sold_out";

  const range = parseKoHoursRange(s.hours.ko);
  if (!range) return "open";

  const nowMin = nowKst.getHours() * 60 + nowKst.getMinutes();
  const { startMin, endMin } = range;

  // Overnight range e.g. 18:00 - 02:00
  if (endMin <= startMin) {
    const open = nowMin >= startMin || nowMin < endMin;
    if (open) return "open";
    return "pre_open";
  }

  if (nowMin < startMin) return "pre_open";
  if (nowMin >= endMin) return "closed";
  return "open";
}

export function storeById(id: string): Store | undefined {
  return stores.find((x) => x.id === id);
}

export const stores: Store[] = [
  {
    id: "1",
    name: "왕꼬치",
    nameEn: "King Skewer",
    category: "꼬치",
    categoryEn: "Skewers",
    storeType: "food_truck",
    emoji: "🍢",
    tagline: { ko: "숯불향 가득한 꼬치 한 입.", en: "Charcoal skewers, one bite at a time." },
    description: "숯불에 직접 구운 다양한 꼬치 전문점. 비법 양념이 일품!",
    descriptionEn: "Charcoal-grilled skewers with a secret glaze.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.8,
    waitTime: 15,
    lat: 37.4722,
    lng: 126.6085,
    x: 20,
    y: 25,
    queueCount: 12,
    hasReward: true,
    hasCoupon: true,
    vibeTags: ["불맛", "가족", "야외"],
    vibeTagsEn: ["Smoky", "Family", "Outdoor"],
    menu: [
      { name: "소고기 꼬치", price: 4000, description: "프리미엄 소고기", popular: true, signature: true },
      { name: "닭꼬치", price: 3000, description: "달콤한 데리야끼 소스", spicy: true },
      { name: "새우 꼬치", price: 5000, description: "대왕 새우 2마리", popular: true },
      { name: "떡꼬치", price: 2500, description: "매콤달콤 떡꼬치", spicy: true },
    ],
    reviews: [
      { id: "r1-1", userName: "김민준", rating: 5, comment: "숯불향이 진짜 일품이에요. 소고기 꼬치 강추!", commentEn: "The smoky flavor is amazing. Highly recommend the beef skewer!", menuItem: "소고기 꼬치", date: "2026-04-20" },
      { id: "r1-2", userName: "Sarah K.", rating: 5, comment: "Best skewers I've had at a night market!", commentEn: "Best skewers I've had at a night market!", menuItem: "새우 꼬치", date: "2026-04-22" },
      { id: "r1-3", userName: "이지은", rating: 4, comment: "닭꼬치 양념이 딱 맞아요. 조금 매운 편이지만 맛있어요.", commentEn: "The tare sauce on chicken skewer is just right — a bit spicy but delicious.", menuItem: "닭꼬치", date: "2026-04-23" },
    ],
  },
  {
    id: "2",
    name: "타코야끼 천국",
    nameEn: "Takoyaki Heaven",
    category: "타코야끼",
    categoryEn: "Takoyaki",
    storeType: "food_truck",
    emoji: "🐙",
    description: "일본 정통 타코야끼를 그대로! 겉바속촉의 정석.",
    descriptionEn: "Crispy outside, creamy inside — classic takoyaki.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.6,
    waitTime: 10,
    lat: 37.4727,
    lng: 126.6100,
    x: 45,
    y: 18,
    queueCount: 8,
    hasCoupon: true,
    vibeTags: ["바삭", "인스타"],
    vibeTagsEn: ["Crispy", "Photo spot"],
    menu: [
      { name: "오리지널 (6개)", price: 5000, description: "클래식 타코야끼", popular: true },
      { name: "치즈 (6개)", price: 6000, description: "모짜렐라 치즈 듬뿍" },
      { name: "명란마요 (6개)", price: 6500, description: "매콤한 명란 토핑", spicy: true },
    ],
    reviews: [
      { id: "r2-1", userName: "박서연", rating: 5, comment: "오리지널이 제일 맛있어요. 겉은 바삭 속은 쫄깃!", commentEn: "Original is the best — crispy outside, chewy inside!", menuItem: "오리지널 (6개)", date: "2026-04-21" },
      { id: "r2-2", userName: "Tom W.", rating: 4, comment: "Cheese version is indulgent and worth it.", commentEn: "Cheese version is indulgent and worth it.", menuItem: "치즈 (6개)", date: "2026-04-24" },
      { id: "r2-3", userName: "민지", rating: 5, comment: "오리지널 탭 풀가동 각.", commentEn: "Original all day.", menuItem: "오리지널 (6개)", date: "2026-04-22" },
      { id: "r2-4", userName: "준호", rating: 4, comment: "웨이팅 있지만 회전 빨라요.", commentEn: "Line moves fast.", menuItem: "오리지널 (6개)", date: "2026-04-23" },
      { id: "r2-5", userName: "Nina", rating: 5, comment: "Bonito flakes still dancing — love it.", commentEn: "Bonito flakes still dancing — love it.", menuItem: "오리지널 (6개)", date: "2026-04-24" },
      { id: "r2-6", userName: "서준", rating: 5, comment: "소스 간이 딱이에요.", commentEn: "Sauce balance is perfect.", menuItem: "오리지널 (6개)", date: "2026-04-25" },
      { id: "r2-7", userName: "Yuki", rating: 4, comment: "大阪っぽい味。", commentEn: "Tastes like Osaka.", menuItem: "오리지널 (6개)", date: "2026-04-26" },
    ],
  },
  {
    id: "3",
    name: "버블티 하우스",
    nameEn: "Bubble Tea House",
    category: "음료",
    categoryEn: "Drinks",
    storeType: "food_truck",
    emoji: "🧋",
    description: "수제 버블티와 과일 음료 전문. 직접 만든 타피오카 펄!",
    descriptionEn: "House-made pearls and fruit drinks.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.5,
    waitTime: 5,
    lat: 37.4731,
    lng: 126.6113,
    x: 70,
    y: 30,
    queueCount: 5,
    hasReward: true,
    vibeTags: ["달달", "휴식"],
    vibeTagsEn: ["Sweet", "Chill"],
    menu: [
      { name: "흑당 버블티", price: 5500, description: "진한 흑당 밀크티", popular: true },
      { name: "딸기 스무디", price: 6000, description: "생딸기 100%" },
      { name: "망고 주스", price: 5000, description: "태국산 망고" },
      { name: "레몬에이드", price: 4500, description: "상큼한 수제 레몬에이드" },
    ],
    reviews: [
      { id: "r3-1", userName: "최유리", rating: 5, comment: "흑당 버블티 진짜 맛있어요! 펄이 쫄깃쫄깃해요.", commentEn: "The brown sugar bubble tea is so good! Pearls are perfectly chewy.", menuItem: "흑당 버블티", date: "2026-04-20" },
      { id: "r3-2", userName: "Emma L.", rating: 4, comment: "Strawberry smoothie was fresh and not too sweet.", commentEn: "Strawberry smoothie was fresh and not too sweet.", menuItem: "딸기 스무디", date: "2026-04-25" },
    ],
  },
  {
    id: "4",
    name: "호떡 명가",
    nameEn: "Hotteok Masters",
    category: "디저트",
    categoryEn: "Dessert",
    storeType: "food_court",
    emoji: "🥞",
    description: "할머니 비법 레시피로 만든 바삭한 호떡.",
    descriptionEn: "Crispy hotteok from a family recipe.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.9,
    waitTime: 20,
    lat: 37.4736,
    lng: 126.6127,
    x: 35,
    y: 55,
    queueCount: 18,
    crowdLevel: "busy",
    hasCoupon: true,
    vibeTags: ["전통", "따뜻함"],
    vibeTagsEn: ["Traditional", "Cozy"],
    menu: [
      { name: "씨앗 호떡", price: 2000, description: "견과류 가득", popular: true },
      { name: "꿀 호떡", price: 2000, description: "달콤한 꿀 시럽" },
      { name: "치즈 호떡", price: 2500, description: "늘어나는 치즈!", popular: true, signature: true },
    ],
    reviews: [
      { id: "r4-1", userName: "정하은", rating: 5, comment: "치즈 호떡 대박이에요. 치즈가 엄청 늘어나요!", commentEn: "Cheese hotteok is amazing — the cheese pull is incredible!", menuItem: "치즈 호떡", date: "2026-04-19" },
      { id: "r4-2", userName: "강도현", rating: 5, comment: "씨앗 호떡 바삭함이 최고예요. 줄서도 기다릴 만해요.", commentEn: "Seed hotteok crunch is top tier. Worth the wait.", menuItem: "씨앗 호떡", date: "2026-04-22" },
    ],
  },
  {
    id: "5",
    name: "연안 꽃게 포장마차",
    nameEn: "Yeonan Crab Stall",
    category: "포장마차",
    categoryEn: "Street stall",
    storeType: "food_court",
    emoji: "🦀",
    description: "신선한 해산물을 즉석에서 요리해드립니다.",
    descriptionEn: "Fresh seafood cooked to order.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.7,
    waitTime: 25,
    lat: 37.4740,
    lng: 126.6142,
    x: 60,
    y: 65,
    queueCount: 15,
    crowdLevel: "busy",
    hasReward: true,
    vibeTags: ["프리미엄", "회"],
    vibeTagsEn: ["Premium", "Sashimi"],
    menu: [
      { name: "조개구이 세트", price: 15000, description: "모듬 조개구이", popular: true },
      { name: "새우튀김", price: 8000, description: "바삭한 새우튀김 5마리" },
      { name: "오징어볶음", price: 10000, description: "매콤 오징어볶음", spicy: true },
      { name: "해물파전", price: 12000, description: "바삭한 해물파전", signature: true },
    ],
    reviews: [
      { id: "r5-1", userName: "이수호", rating: 5, comment: "조개구이 세트 강추! 신선도가 정말 달라요.", commentEn: "Clam grill set is highly recommended — freshness is on another level.", menuItem: "조개구이 세트", date: "2026-04-21" },
      { id: "r5-2", userName: "Jenny M.", rating: 4, comment: "Seafood pajeon was crispy and packed with filling.", commentEn: "Seafood pajeon was crispy and packed with filling.", menuItem: "해물파전", date: "2026-04-23" },
    ],
  },
  {
    id: "14",
    name: "연안 매운탕 포차",
    nameEn: "Yeonan Spicy Fish Soup Stall",
    category: "포장마차",
    categoryEn: "Street stall",
    storeType: "food_court",
    emoji: "🍲",
    description: "얼큰한 매운탕과 어묵 한 그릇으로 몸 녹이기.",
    descriptionEn: "Spicy fish soup and oden — warm up by the pier.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.5,
    waitTime: 12,
    lat: 37.4738,
    lng: 126.6148,
    x: 58,
    y: 68,
    queueCount: 7,
    crowdLevel: "moderate",
    vibeTags: ["얼큰", "한그릇"],
    vibeTagsEn: ["Spicy", "Comfort bowl"],
    menu: [
      { name: "대구 매운탕", price: 9000, description: "시원한 국물", popular: true, spicy: true },
      { name: "해물 어묵탕", price: 7000, description: "어묵·오징어 듬뿍" },
      { name: "라면 추가", price: 2000, description: "국물에 말아 먹기" },
    ],
    reviews: [
      { id: "r14-1", userName: "김서연", rating: 5, comment: "매운탕 국물이 진짜 시원해요. 바람 부는 날 최고.", commentEn: "The soup is so refreshing — perfect on a windy night.", menuItem: "대구 매운탕", date: "2026-04-24" },
    ],
  },
  {
    id: "6",
    name: "붕어빵 & 와플",
    nameEn: "Bungeoppang & Waffle",
    category: "디저트",
    categoryEn: "Dessert",
    storeType: "food_court",
    emoji: "🐟",
    description: "팥앙금 가득 붕어빵과 벨기에식 와플!",
    descriptionEn: "Filled fish cakes and Belgian waffles.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.4,
    waitTime: 8,
    lat: 37.4745,
    lng: 126.6156,
    x: 82,
    y: 50,
    queueCount: 6,
    vibeTags: ["간식", "달콤"],
    vibeTagsEn: ["Snack", "Sweet"],
    menu: [
      { name: "붕어빵 (3개)", price: 2000, description: "달콤한 팥 가득" },
      { name: "슈크림 붕어빵 (3개)", price: 3000, description: "진한 커스터드 크림", popular: true },
      { name: "벨기에 와플", price: 5000, description: "생크림 + 과일 토핑", signature: true },
      { name: "버터 팝콘", price: 4000, description: "고소한 시네마 스타일", popular: true },
      { name: "달고나 팝콘", price: 4500, description: "달콤한 코팅 팝콘" },
      { name: "미니 호떡 (2개)", price: 2500, description: "한 입 크기 꿀호떡" },
    ],
    reviews: [
      { id: "r6-1", userName: "오민서", rating: 4, comment: "슈크림 붕어빵 엄청 고소해요! 따뜻할 때 먹어야 해요.", commentEn: "Cream puff fish cake is so rich! Best eaten warm.", menuItem: "슈크림 붕어빵 (3개)", date: "2026-04-24" },
      { id: "r6-2", userName: "다은", rating: 5, comment: "버터 팝콘 향이 진짜 영화관 같아요.", commentEn: "Butter popcorn smells like the cinema.", menuItem: "버터 팝콘", date: "2026-04-25" },
      { id: "r6-3", userName: "Leo", rating: 4, comment: "Waffle line was worth it.", commentEn: "Waffle line was worth it.", menuItem: "벨기에 와플", date: "2026-04-26" },
    ],
  },
  {
    id: "7",
    name: "닭강정 킹",
    nameEn: "Gangjeong King",
    category: "치킨",
    categoryEn: "Chicken",
    storeType: "food_truck",
    emoji: "🍗",
    description: "매콤달콤 닭강정! 주문 즉시 튀겨드립니다.",
    descriptionEn: "Sweet-spicy Korean fried chicken bites, fried fresh.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.6,
    waitTime: 12,
    lat: 37.4775,
    lng: 126.6175,
    x: 15,
    y: 70,
    queueCount: 10,
    hasCoupon: true,
    vibeTags: ["매운맛", "치킨"],
    vibeTagsEn: ["Spicy", "Chicken"],
    menu: [
      { name: "순한맛 (중)", price: 8000, description: "아이들도 좋아하는 달콤한 맛" },
      { name: "매운맛 (중)", price: 8000, description: "중독성 있는 매콤한 맛", popular: true, spicy: true },
      { name: "간장맛 (중)", price: 8000, description: "깊은 간장 소스" },
      { name: "양념 반 후라이드 반", price: 10000, description: "두 가지 맛을 한번에!", signature: true },
    ],
    reviews: [
      { id: "r7-1", userName: "한지훈", rating: 5, comment: "매운맛 진짜 중독돼요. 계속 생각나는 맛!", commentEn: "The spicy version is addictive. I keep thinking about it!", menuItem: "매운맛 (중)", date: "2026-04-20" },
      { id: "r7-2", userName: "Alex P.", rating: 5, comment: "Half & half combo is the way to go. Fried fresh to order!", commentEn: "Half & half combo is the way to go. Fried fresh to order!", menuItem: "양념 반 후라이드 반", date: "2026-04-22" },
    ],
  },
  {
    id: "8",
    name: "솜사탕 구름",
    nameEn: "Cotton Cloud",
    category: "디저트",
    categoryEn: "Dessert",
    storeType: "food_court",
    emoji: "🍭",
    description: "형형색색 예쁜 솜사탕! 인스타 필수 코스.",
    descriptionEn: "Rainbow cotton candy — made for photos.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.3,
    waitTime: 3,
    lat: 37.4742,
    lng: 126.6162,
    x: 50,
    y: 82,
    queueCount: 3,
    crowdLevel: "low",
    vibeTags: ["컬러풀", "키즈"],
    vibeTagsEn: ["Colorful", "Kids"],
    menu: [
      { name: "레인보우 솜사탕", price: 4000, description: "7가지 컬러", popular: true },
      { name: "꽃 솜사탕", price: 5000, description: "장미 모양 솜사탕" },
      { name: "캐릭터 솜사탕", price: 6000, description: "귀여운 캐릭터 모양" },
    ],
    reviews: [
      { id: "r8-1", userName: "윤채원", rating: 5, comment: "레인보우 솜사탕 너무 예뻐요! 사진 찍기 딱이에요.", commentEn: "Rainbow cotton candy looks stunning — perfect for photos!", menuItem: "레인보우 솜사탕", date: "2026-04-25" },
    ],
  },
  // 인천종합어시장 구역 — 지하 3곳
  {
    id: "9",
    name: "연안 활어회",
    nameEn: "Yeonan Live Fish Sashimi",
    category: "회",
    categoryEn: "Sashimi",
    storeType: "restaurant",
    emoji: "🐟",
    tagline: { ko: "당일 입고 활어로 바로 뜹니다.", en: "Sashimi from today’s catch." },
    description: "인천종합어시장 지하에서 바로 손질하는 활어회 전문.",
    descriptionEn: "Live fish sashimi prepared in the market basement.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.6,
    waitTime: 18,
    lat: 37.4541,
    lng: 126.6064,
    x: 50,
    y: 50,
    queueCount: 11,
    floorLabel: { ko: "지하 1층 (B1)", en: "Basement 1 (B1)" },
    vibeTags: ["회", "신선"],
    vibeTagsEn: ["Sashimi", "Fresh"],
    menu: [
      { name: "광어회 소", price: 35000, description: "2인 기준", popular: true },
      { name: "우럭회", price: 28000, description: "소자", signature: true },
    ],
    reviews: [{ id: "r9-1", userName: "박지훈", rating: 5, comment: "B1에서 이렇게 신선한 회 처음!", commentEn: "So fresh for B1 market!", menuItem: "광어회 소", date: "2026-04-26" }],
  },
  {
    id: "10",
    name: "바다손질",
    nameEn: "Sea Prep",
    category: "해산물",
    categoryEn: "Seafood",
    storeType: "restaurant",
    emoji: "🐟",
    tagline: { ko: "원하는 손질 그대로 맞춰드립니다.", en: "Custom cuts while you wait." },
    description: "회·구이용 손질과 포장을 빠르게 처리합니다.",
    descriptionEn: "Fast prep and packing for sashimi or grill.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.4,
    waitTime: 12,
    lat: 37.45405,
    lng: 126.6065,
    x: 51,
    y: 51,
    queueCount: 7,
    floorLabel: { ko: "지하 1층 (B1)", en: "Basement 1 (B1)" },
    vibeTags: ["손질", "포장"],
    vibeTagsEn: ["Prep", "Pack"],
    menu: [
      { name: "광어 손질", price: 5000, description: "기본 손질", popular: true },
      { name: "전복 손질", price: 3000, description: "껍질 제거" },
    ],
    reviews: [{ id: "r10-1", userName: "이나영", rating: 4, comment: "손질 깔끔해요.", commentEn: "Very clean prep.", menuItem: "광어 손질", date: "2026-04-26" }],
  },
  {
    id: "11",
    name: "제철 조개찜",
    nameEn: "Seasonal Clam Steam",
    category: "해산물",
    categoryEn: "Seafood",
    storeType: "restaurant",
    emoji: "🐟",
    tagline: { ko: "제철 조개로 뜨끈한 한 상.", en: "Steaming seasonal clams." },
    description: "지하 매장에서 조개찜·탕을 즉석 조리합니다.",
    descriptionEn: "Clam stew cooked to order in the basement.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.5,
    waitTime: 22,
    lat: 37.45415,
    lng: 126.60635,
    x: 52,
    y: 52,
    queueCount: 14,
    floorLabel: { ko: "지하 1층 (B1)", en: "Basement 1 (B1)" },
    vibeTags: ["조개", "뜨끈"],
    vibeTagsEn: ["Clams", "Hot pot"],
    menu: [
      { name: "모둠 조개찜", price: 45000, description: "2~3인", popular: true },
      { name: "바지락 칼국수", price: 9000, description: "1인" },
    ],
    reviews: [{ id: "r11-1", userName: "최민", rating: 5, comment: "B1인데 분위기 좋아요.", commentEn: "Nice vibe even in B1.", menuItem: "모둠 조개찜", date: "2026-04-26" }],
  },
  // 2층 2곳
  {
    id: "12",
    name: "연안 횟집 2층",
    nameEn: "Yeonan Sashimi 2F",
    category: "회",
    categoryEn: "Sashimi",
    storeType: "restaurant",
    emoji: "🐟",
    tagline: { ko: "2층 창가 자리에서 한눈에 보는 야경.", en: "Window seats with a view on 2F." },
    description: "2층 전용 좌석에서 회 코스와 단품을 즐길 수 있습니다.",
    descriptionEn: "Sashimi courses and à la carte on the second floor.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.7,
    waitTime: 25,
    lat: 37.4542,
    lng: 126.60645,
    x: 53,
    y: 53,
    queueCount: 18,
    floorLabel: { ko: "2층", en: "2nd floor" },
    vibeTags: ["야경", "코스"],
    vibeTagsEn: ["View", "Course"],
    menu: [
      { name: "회 코스 A", price: 55000, description: "2인", popular: true, signature: true },
      { name: "광어 미니", price: 22000, description: "1인" },
    ],
    reviews: [{ id: "r12-1", userName: "Sarah", rating: 5, comment: "2층 뷰 최고!", commentEn: "Best view on 2F!", menuItem: "회 코스 A", date: "2026-04-26" }],
  },
  {
    id: "13",
    name: "어시장 카페 2층",
    nameEn: "Market Cafe 2F",
    category: "카페",
    categoryEn: "Cafe",
    storeType: "restaurant",
    emoji: "🐟",
    tagline: { ko: "장 보고 올라와 커피 한 잔.", en: "Coffee after shopping the market." },
    description: "2층에서 간단한 브런치와 음료를 제공합니다.",
    descriptionEn: "Light brunch and drinks on the second floor.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.2,
    waitTime: 8,
    lat: 37.45418,
    lng: 126.60642,
    x: 54,
    y: 54,
    queueCount: 4,
    floorLabel: { ko: "2층", en: "2nd floor" },
    vibeTags: ["커피", "브런치"],
    vibeTagsEn: ["Coffee", "Brunch"],
    menu: [
      { name: "아메리카노", price: 3500, description: "HOT/ICE", popular: true },
      { name: "팥빙수", price: 8000, description: "여름 한정" },
    ],
    reviews: [{ id: "r13-1", userName: "김도윤", rating: 4, comment: "2층이라 한산해요.", commentEn: "Quiet on 2F.", menuItem: "아메리카노", date: "2026-04-26" }],
  },
  {
    id: "15",
    name: "팔미도 미니 요트",
    nameEn: "Palmido mini yacht",
    category: "체험",
    categoryEn: "Experience",
    storeType: "restaurant",
    emoji: "🚢",
    description: "연안 여객 터미널에서 출발하는 팔미도 미니 요트 투어. 쿠폰은 승선권 데스크에서 사용하세요.",
    descriptionEn: "Palmido mini yacht from the coastal terminal. Redeem your coupon at the boarding desk.",
    hours: { ko: "11:00 – 21:00", en: "11 AM – 9 PM" },
    rating: 4.6,
    waitTime: 5,
    lat: 37.4564120594447,
    lng: 126.600708565657,
    x: 50,
    y: 48,
    queueCount: 0,
    hasCoupon: true,
    crowdLevel: "low",
    vibeTags: ["해상", "럭셔리"],
    vibeTagsEn: ["Seaside", "Scenic"],
    menu: [
      { name: "미니 요트 1인 (기본)", price: 20000, description: "주말·성수기 별도", popular: true },
    ],
    reviews: [
      {
        id: "r15-1",
        userName: "이하늘",
        rating: 5,
        comment: "짧은 코스인데 바람이 정말 시원해요.",
        commentEn: "Short course but the sea breeze is great.",
        menuItem: "미니 요트 1인 (기본)",
        date: "2026-04-25",
      },
    ],
  },
];
