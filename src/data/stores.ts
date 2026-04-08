export type CrowdLevel = "low" | "moderate" | "busy";
export type VendorStatus = "open" | "sold_out" | "closing_soon";

export interface MenuItem {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  spicy?: boolean;
  signature?: boolean;
  soldOut?: boolean;
}

export interface Store {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  emoji: string;
  description: string;
  descriptionEn: string;
  rating: number;
  waitTime: number;
  x: number;
  y: number;
  menu: MenuItem[];
  queueCount: number;
  crowdLevel?: CrowdLevel;
  vendorStatus?: VendorStatus;
  vibeTags?: string[];
  vibeTagsEn?: string[];
  hasReward?: boolean;
  hasCoupon?: boolean;
}

export function inferCrowdLevel(s: Store): CrowdLevel {
  if (s.crowdLevel) return s.crowdLevel;
  if (s.waitTime <= 8) return "low";
  if (s.waitTime <= 16) return "moderate";
  return "busy";
}

export function getVendorStatus(s: Store): VendorStatus {
  return s.vendorStatus ?? "open";
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
    emoji: "🍢",
    description: "숯불에 직접 구운 다양한 꼬치 전문점. 비법 양념이 일품!",
    descriptionEn: "Charcoal-grilled skewers with a secret glaze.",
    rating: 4.8,
    waitTime: 15,
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
  },
  {
    id: "2",
    name: "타코야끼 천국",
    nameEn: "Takoyaki Heaven",
    category: "타코야끼",
    categoryEn: "Takoyaki",
    emoji: "🐙",
    description: "일본 정통 타코야끼를 그대로! 겉바속촉의 정석.",
    descriptionEn: "Crispy outside, creamy inside — classic takoyaki.",
    rating: 4.6,
    waitTime: 10,
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
  },
  {
    id: "3",
    name: "버블티 하우스",
    nameEn: "Bubble Tea House",
    category: "음료",
    categoryEn: "Drinks",
    emoji: "🧋",
    description: "수제 버블티와 과일 음료 전문. 직접 만든 타피오카 펄!",
    descriptionEn: "House-made pearls and fruit drinks.",
    rating: 4.5,
    waitTime: 5,
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
  },
  {
    id: "4",
    name: "호떡 명가",
    nameEn: "Hotteok Masters",
    category: "디저트",
    categoryEn: "Dessert",
    emoji: "🥞",
    description: "할머니 비법 레시피로 만든 바삭한 호떡.",
    descriptionEn: "Crispy hotteok from a family recipe.",
    rating: 4.9,
    waitTime: 20,
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
  },
  {
    id: "5",
    name: "해물 포차",
    nameEn: "Seafood Pocha",
    category: "해산물",
    categoryEn: "Seafood",
    emoji: "🦀",
    description: "신선한 해산물을 즉석에서 요리해드립니다.",
    descriptionEn: "Fresh seafood cooked to order.",
    rating: 4.7,
    waitTime: 25,
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
  },
  {
    id: "6",
    name: "붕어빵 & 와플",
    nameEn: "Bungeoppang & Waffle",
    category: "디저트",
    categoryEn: "Dessert",
    emoji: "🐟",
    description: "팥앙금 가득 붕어빵과 벨기에식 와플!",
    descriptionEn: "Filled fish cakes and Belgian waffles.",
    rating: 4.4,
    waitTime: 8,
    x: 82,
    y: 50,
    queueCount: 6,
    vibeTags: ["간식", "달콤"],
    vibeTagsEn: ["Snack", "Sweet"],
    menu: [
      { name: "붕어빵 (3개)", price: 2000, description: "달콤한 팥 가득" },
      { name: "슈크림 붕어빵 (3개)", price: 3000, description: "진한 커스터드 크림", popular: true },
      { name: "벨기에 와플", price: 5000, description: "생크림 + 과일 토핑", soldOut: true },
    ],
  },
  {
    id: "7",
    name: "닭강정 킹",
    nameEn: "Gangjeong King",
    category: "치킨",
    categoryEn: "Chicken",
    emoji: "🍗",
    description: "매콤달콤 닭강정! 주문 즉시 튀겨드립니다.",
    descriptionEn: "Sweet-spicy Korean fried chicken bites, fried fresh.",
    rating: 4.6,
    waitTime: 12,
    x: 15,
    y: 70,
    queueCount: 10,
    vendorStatus: "closing_soon",
    hasCoupon: true,
    vibeTags: ["매운맛", "치킨"],
    vibeTagsEn: ["Spicy", "Chicken"],
    menu: [
      { name: "순한맛 (중)", price: 8000, description: "아이들도 좋아하는 달콤한 맛" },
      { name: "매운맛 (중)", price: 8000, description: "중독성 있는 매콤한 맛", popular: true, spicy: true },
      { name: "간장맛 (중)", price: 8000, description: "깊은 간장 소스" },
      { name: "양념 반 후라이드 반", price: 10000, description: "두 가지 맛을 한번에!", signature: true },
    ],
  },
  {
    id: "8",
    name: "솜사탕 구름",
    nameEn: "Cotton Cloud",
    category: "디저트",
    categoryEn: "Dessert",
    emoji: "🍭",
    description: "형형색색 예쁜 솜사탕! 인스타 필수 코스.",
    descriptionEn: "Rainbow cotton candy — made for photos.",
    rating: 4.3,
    waitTime: 3,
    x: 50,
    y: 82,
    queueCount: 3,
    crowdLevel: "low",
    vendorStatus: "open",
    vibeTags: ["컬러풀", "키즈"],
    vibeTagsEn: ["Colorful", "Kids"],
    menu: [
      { name: "레인보우 솜사탕", price: 4000, description: "7가지 컬러", popular: true },
      { name: "꽃 솜사탕", price: 5000, description: "장미 모양 솜사탕" },
      { name: "캐릭터 솜사탕", price: 6000, description: "귀여운 캐릭터 모양" },
    ],
  },
];
