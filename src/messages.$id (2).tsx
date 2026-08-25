import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, P, UL } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "개인정보 처리방침 — SUGO" },
      { name: "description", content: "SUGO의 개인정보 수집 및 처리 방침입니다." },
      { property: "og:title", content: "개인정보 처리방침 — SUGO" },
      { property: "og:description", content: "SUGO의 개인정보 수집 및 처리 방침입니다." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="개인정보 처리방침"
      lastUpdated="2026년 7월 7일"
      intro="SUGO는 회원의 개인정보를 소중하게 다루며, 관련 법령을 준수합니다."
      sections={[
        {
          id: "collect",
          title: "수집하는 개인정보 항목",
          content: (
            <UL
              items={[
                "필수 — 이메일, 닉네임, 비밀번호, 지역",
                "선택 — 프로필 사진, 업체명, 업종",
                "자동 수집 — 접속 로그, 기기 정보, 쿠키",
              ]}
            />
          ),
        },
        {
          id: "purpose",
          title: "이용 목적",
          content: (
            <UL
              items={[
                "회원 식별 및 로그인",
                "상품 등록 및 거래 중개",
                "고객 문의 응대 및 분쟁 조정",
                "서비스 개선 및 통계 분석",
              ]}
            />
          ),
        },
        {
          id: "retention",
          title: "보유 및 이용 기간",
          content: (
            <P>
              회원 탈퇴 시 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한
              경우 해당 기간 동안 보관합니다.
            </P>
          ),
        },
        {
          id: "sharing",
          title: "제3자 제공",
          content: (
            <P>
              회사는 원칙적으로 회원의 개인정보를 외부에 제공하지 않습니다. 법령에
              근거하거나 수사기관의 정당한 요청이 있는 경우에 한해 예외적으로
              제공할 수 있습니다.
            </P>
          ),
        },
        {
          id: "rights",
          title: "이용자의 권리",
          content: (
            <UL
              items={[
                "개인정보 열람, 정정, 삭제 요청",
                "처리 정지 요청",
                "동의 철회 및 회원 탈퇴",
              ]}
            />
          ),
        },
        {
          id: "security",
          title: "안전성 확보 조치",
          content: (
            <P>
              비밀번호는 암호화하여 저장하며, 접근 권한 관리와 접속 기록 보관 등을
              통해 개인정보를 안전하게 보호합니다.
            </P>
          ),
        },
      ]}
    />
  );
}
