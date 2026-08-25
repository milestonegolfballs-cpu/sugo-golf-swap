// 사업자 정보 — 여기 값만 채워 넣으면 하단 사업자정보 표기와
// /legal/business 페이지에 자동으로 반영됩니다.
// 통신판매업 신고 완료 후 실제 정보로 교체해주세요.
export const BUSINESS_INFO = {
  companyName: "OOO", // 상호(법인명 또는 개인사업자명)
  ceoName: "OOO", // 대표자명
  businessNumber: "000-00-00000", // 사업자등록번호
  mailOrderNumber: "제0000-서울OO-00000호", // 통신판매업 신고번호
  address: "OOO OOO OOO", // 사업장 주소
  email: "support@sugo.golf",
  phone: "0000-0000", // 고객센터 전화번호 (선택)
  hostingProvider: "Vercel Inc.", // 호스팅서비스 제공자
} as const;
