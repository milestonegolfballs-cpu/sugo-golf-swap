import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, P, UL } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/legal/report")({
  head: () => ({
    meta: [
      { title: "신고 정책 — SUGO" },
      { name: "description", content: "SUGO의 신고 접수 및 처리 정책입니다." },
      { property: "og:title", content: "신고 정책 — SUGO" },
      { property: "og:description", content: "SUGO의 신고 접수 및 처리 정책입니다." },
    ],
  }),
  component: ReportPolicyPage,
});

function ReportPolicyPage() {
  return (
    <LegalPage
      title="신고 정책"
      lastUpdated="2026년 7월 7일"
      intro="SUGO는 건강한 거래 환경을 위해 부적절한 게시물과 사용자에 대한 신고를 받고 있습니다."
      sections={[
        {
          id: "what",
          title: "신고 대상",
          content: (
            <UL
              items={[
                "판매 금지 품목 등록",
                "허위 매물 및 사기 의심",
                "욕설, 위협, 성희롱 등 부적절한 대화",
                "스팸 또는 광고성 게시물",
                "타인 사칭 및 명의 도용",
              ]}
            />
          ),
        },
        {
          id: "how",
          title: "신고 방법",
          content: (
            <P>
              상품 상세 페이지 또는 채팅방의 신고 버튼을 통해 접수해주세요. 상황을
              구체적으로 설명하고 필요 시 증거 자료(스크린샷 등)를 함께 제출해주세요.
            </P>
          ),
        },
        {
          id: "process",
          title: "처리 절차",
          content: (
            <UL
              items={[
                "1단계 — 신고 접수 및 검토 (24시간 이내)",
                "2단계 — 필요한 경우 관련 당사자 소명 요청",
                "3단계 — 조치 결정 (경고 / 게시물 삭제 / 계정 정지)",
                "4단계 — 신고자에게 처리 결과 안내",
              ]}
            />
          ),
        },
        {
          id: "penalty",
          title: "제재 기준",
          content: (
            <UL
              items={[
                "경고 — 경미한 규정 위반",
                "게시물 삭제 — 판매 금지 품목, 허위 매물",
                "일시 정지 — 반복 위반",
                "영구 정지 — 사기, 심각한 규정 위반",
              ]}
            />
          ),
        },
        {
          id: "abuse",
          title: "허위 신고 방지",
          content: (
            <P>
              악의적이거나 반복적인 허위 신고는 신고자에게 불이익이 발생할 수 있습니다.
              신고 기능을 신중하게 사용해주세요.
            </P>
          ),
        },
      ]}
    />
  );
}
