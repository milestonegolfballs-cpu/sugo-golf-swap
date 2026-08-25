import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, P } from "@/components/legal/LegalPage";
import { BUSINESS_INFO } from "@/lib/business";

export const Route = createFileRoute("/legal/business")({
  head: () => ({
    meta: [
      { title: "사업자 정보 — SUGO" },
      { name: "description", content: "SUGO 통신판매업자 정보입니다." },
      { property: "og:title", content: "사업자 정보 — SUGO" },
      { property: "og:description", content: "SUGO 통신판매업자 정보입니다." },
    ],
  }),
  component: BusinessInfoPage,
});

const ROWS: [string, string][] = [
  ["상호", BUSINESS_INFO.companyName],
  ["대표자", BUSINESS_INFO.ceoName],
  ["사업자등록번호", BUSINESS_INFO.businessNumber],
  ["통신판매업 신고번호", BUSINESS_INFO.mailOrderNumber],
  ["사업장 주소", BUSINESS_INFO.address],
  ["고객센터 이메일", BUSINESS_INFO.email],
  ...(BUSINESS_INFO.phone ? ([["고객센터 전화", BUSINESS_INFO.phone]] as [string, string][]) : []),
  ["호스팅서비스 제공자", BUSINESS_INFO.hostingProvider],
];

function BusinessInfoPage() {
  return (
    <LegalPage
      title="사업자 정보"
      lastUpdated="2026년 7월 7일"
      intro="전자상거래 등에서의 소비자보호에 관한 법률 제10조에 따라 SUGO의 사업자 정보를 안내드립니다."
      sections={[
        {
          id: "info",
          title: "사업자 등록 정보",
          content: (
            <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {ROWS.map(([label, value]) => (
                <div key={label} className="flex items-center gap-4 px-4 py-3">
                  <dt className="w-28 shrink-0 text-[13px] text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-[14px] font-medium text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ),
        },
        {
          id: "role",
          title: "SUGO의 역할",
          content: (
            <P>
              SUGO는 회원 간 골프공 매물 정보를 연결하는 통신판매중개자이며,
              거래 당사자가 아닙니다. 상품 정보의 진위 여부, 거래 이행 및
              사후 처리에 대한 책임은 거래 당사자인 회원에게 있습니다.
            </P>
          ),
        },
      ]}
    />
  );
}
