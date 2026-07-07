import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, P, UL } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/legal/guide")({
  head: () => ({
    meta: [
      { title: "거래 가이드 — SUGO" },
      { name: "description", content: "안전한 골프공 거래를 위한 SUGO 이용 가이드입니다." },
      { property: "og:title", content: "거래 가이드 — SUGO" },
      { property: "og:description", content: "안전한 골프공 거래를 위한 SUGO 이용 가이드입니다." },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <LegalPage
      title="거래 가이드"
      lastUpdated="2026년 7월 7일"
      intro="SUGO에서 안전하고 즐겁게 거래하기 위한 기본 원칙을 안내드립니다."
      sections={[
        {
          id: "seller",
          title: "판매자 가이드",
          content: (
            <UL
              items={[
                "실물과 동일한 사진을 3장 이상 등록하세요.",
                "브랜드, 모델, 상태를 정확하게 기재하세요.",
                "가격은 시세를 참고하여 합리적으로 책정하세요.",
                "문의에는 24시간 이내 응답하는 것을 권장합니다.",
              ]}
            />
          ),
        },
        {
          id: "buyer",
          title: "구매자 가이드",
          content: (
            <UL
              items={[
                "상품 설명과 사진을 꼼꼼히 확인하세요.",
                "궁금한 점은 구매 전에 판매자에게 문의하세요.",
                "직거래 시 안전한 장소에서 만나세요.",
                "택배 거래는 안심결제 이용을 권장합니다.",
              ]}
            />
          ),
        },
        {
          id: "shipping",
          title: "배송과 결제",
          content: (
            <P>
              배송 방법과 결제 수단은 회원 간 협의로 결정합니다. 안전한 거래를 위해
              공식 결제 시스템 이용을 권장하며, 현금 직거래 시에도 영수증을 남기는
              것이 좋습니다.
            </P>
          ),
        },
        {
          id: "trouble",
          title: "분쟁 발생 시",
          content: (
            <P>
              상품에 하자가 있거나 거래에 문제가 발생한 경우, 우선 상대방과 대화로
              해결을 시도해주세요. 해결이 어려운 경우 신고 기능을 통해 SUGO에
              중재를 요청할 수 있습니다.
            </P>
          ),
        },
      ]}
    />
  );
}
