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

export const REGIONS = [
  "서울 강남구",
  "서울 송파구",
  "서울 서초구",
  "서울 마포구",
  "경기 분당",
  "경기 일산",
  "경기 수원",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "기타",
];
