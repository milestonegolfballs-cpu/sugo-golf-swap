export type CategorySlug = "new_practice" | "used_practice" | "lost_ball";

export const CATEGORIES: {
  slug: CategorySlug;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    slug: "new_practice",
    label: "신품 연습공",
    emoji: "🟢",
    description: "박스 그대로의 새 연습공",
  },
  {
    slug: "used_practice",
    label: "중고 연습공",
    emoji: "♻️",
    description: "상태 좋은 중고 연습공",
  },
  {
    slug: "lost_ball",
    label: "로스트볼",
    emoji: "⚪",
    description: "라운드에서 회수한 공",
  },
];

export const CATEGORY_LABEL: Record<CategorySlug, string> = {
  new_practice: "신품 연습공",
  used_practice: "중고 연습공",
  lost_ball: "로스트볼",
};

export const CONDITIONS = [
  { value: "S", label: "S급 (최상)" },
  { value: "A", label: "A급 (상)" },
  { value: "B", label: "B급 (중)" },
  { value: "C", label: "C급 (하)" },
] as const;

// 앱 전체에서 사용하는 단일 지역 목록 (시/도 단위).
// 회원가입, 상품 등록, 검색 필터가 모두 이 목록을 공유합니다.
export const REGIONS = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충북",
  "충남",
  "대전",
  "세종",
  "전북",
  "전남",
  "광주",
  "경북",
  "경남",
  "대구",
  "울산",
  "부산",
  "제주",
];
