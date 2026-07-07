import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, P, UL } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "이용약관 — SUGO" },
      { name: "description", content: "SUGO 서비스 이용약관입니다." },
      { property: "og:title", content: "이용약관 — SUGO" },
      { property: "og:description", content: "SUGO 서비스 이용약관입니다." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="이용약관"
      lastUpdated="2026년 7월 7일"
      intro="본 약관은 SUGO가 제공하는 골프공 중고 거래 서비스의 이용 조건과 절차, 회원과 회사의 권리·의무를 규정합니다."
      sections={[
        {
          id: "purpose",
          title: "목적",
          content: (
            <P>
              본 약관은 회원이 SUGO 서비스를 이용함에 있어 회사와 회원 간의 권리, 의무 및
              책임 사항을 규정함을 목적으로 합니다.
            </P>
          ),
        },
        {
          id: "definitions",
          title: "용어의 정의",
          content: (
            <UL
              items={[
                <><b>서비스</b> — SUGO가 운영하는 골프공 전용 마켓플레이스</>,
                <><b>회원</b> — 본 약관에 동의하고 가입한 자</>,
                <><b>판매자</b> — 서비스에 상품을 등록·판매하는 회원</>,
                <><b>구매자</b> — 판매자의 상품을 구매하는 회원</>,
              ]}
            />
          ),
        },
        {
          id: "account",
          title: "회원 가입 및 계정",
          content: (
            <UL
              items={[
                "만 14세 이상만 가입할 수 있습니다.",
                "허위 정보로 가입한 경우 이용이 제한될 수 있습니다.",
                "계정 정보는 본인이 안전하게 관리해야 합니다.",
              ]}
            />
          ),
        },
        {
          id: "duties",
          title: "회원의 의무",
          content: (
            <UL
              items={[
                "판매 금지 품목을 등록하지 않습니다.",
                "타인의 권리를 침해하는 콘텐츠를 게시하지 않습니다.",
                "허위·과장 정보를 게시하지 않습니다.",
              ]}
            />
          ),
        },
        {
          id: "transaction",
          title: "거래의 성립과 책임",
          content: (
            <P>
              SUGO는 회원 간 자유로운 거래를 중개할 뿐, 개별 거래의 당사자가 아닙니다.
              분쟁이 발생할 경우 당사자 간 해결을 원칙으로 하되, 회사는 필요한 경우
              중재를 지원할 수 있습니다.
            </P>
          ),
        },
        {
          id: "termination",
          title: "이용 제한 및 해지",
          content: (
            <P>
              약관을 위반한 회원에 대해 회사는 사전 통지 후 서비스 이용을 제한하거나
              계정을 해지할 수 있습니다.
            </P>
          ),
        },
        {
          id: "liability",
          title: "면책 조항",
          content: (
            <P>
              천재지변, 회원의 귀책사유로 발생한 손해에 대해 회사는 책임을 지지
              않습니다.
            </P>
          ),
        },
      ]}
    />
  );
}
