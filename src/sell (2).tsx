import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, P, UL } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/legal/prohibited")({
  head: () => ({
    meta: [
      { title: "판매 금지 품목 — SUGO" },
      { name: "description", content: "SUGO에서 판매가 금지된 품목을 안내합니다." },
      { property: "og:title", content: "판매 금지 품목 — SUGO" },
      { property: "og:description", content: "SUGO에서 판매가 금지된 품목을 안내합니다." },
    ],
  }),
  component: ProhibitedPage,
});

function ProhibitedPage() {
  return (
    <LegalPage
      title="판매 금지 품목"
      lastUpdated="2026년 7월 7일"
      intro="SUGO는 골프공 전용 마켓입니다. 아래 항목은 등록이 제한되며, 위반 시 게시글이 삭제되고 계정이 제재될 수 있습니다."
      sections={[
        {
          id: "non-golfball",
          title: "골프공 이외의 상품",
          content: (
            <P>
              SUGO는 오직 골프공만 거래 가능한 마켓입니다. 골프채, 의류, 액세서리 등
              다른 골프 용품은 등록할 수 없습니다.
            </P>
          ),
        },
        {
          id: "fake",
          title: "위조·모조 상품",
          content: (
            <UL
              items={[
                "정품이 아닌 카피 골프공",
                "브랜드 로고를 무단으로 사용한 상품",
                "출처가 불분명한 리퍼비시 상품",
              ]}
            />
          ),
        },
        {
          id: "illegal",
          title: "법령 위반 상품",
          content: (
            <UL
              items={[
                "관세를 신고하지 않은 해외 직수입 상품",
                "도난품 및 장물",
                "허가 없이 유통 불가능한 상품",
              ]}
            />
          ),
        },
        {
          id: "unfair",
          title: "부적절한 판매 행위",
          content: (
            <UL
              items={[
                "동일 상품 중복 등록",
                "거짓 상태 표기 (예: 로스트볼을 신품으로 표기)",
                "시세 교란을 위한 대량 등록",
                "타 플랫폼 유도 및 외부 결제 강요",
              ]}
            />
          ),
        },
      ]}
    />
  );
}
