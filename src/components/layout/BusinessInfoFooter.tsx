import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/business";

// 전자상거래법 제10조에 따른 통신판매업자 정보 표기.
// 기본은 접혀 있고, 펼치면 상세 정보가 보이는 형태 — 필수 정보는
// 화면에 노출하되 홈 화면의 시각적 흐름은 해치지 않도록 구성했습니다.
export function BusinessInfoFooter() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="border-t border-border px-5 py-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-[11px] font-medium text-muted-foreground">
          사업자 정보
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Row label="상호" value={BUSINESS_INFO.companyName} />
          <Row label="대표자" value={BUSINESS_INFO.ceoName} />
          <Row label="사업자등록번호" value={BUSINESS_INFO.businessNumber} />
          <Row
            label="통신판매업 신고번호"
            value={BUSINESS_INFO.mailOrderNumber}
          />
          <Row label="주소" value={BUSINESS_INFO.address} />
          <Row label="이메일" value={BUSINESS_INFO.email} />
          {BUSINESS_INFO.phone && (
            <Row label="고객센터" value={BUSINESS_INFO.phone} />
          )}
        </dl>
      )}

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground/70">
        SUGO는 회원 간 골프공 거래를 위한 정보 교환 서비스를 제공하며,
        통신판매의 당사자가 아닙니다. 회원 간 개별적으로 진행되는 거래와
        관련하여 발생하는 문제에 대해 SUGO는 원칙적으로 책임을 지지 않습니다.
      </p>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground/70">
        <Link to="/legal/terms" className="hover:text-foreground">
          이용약관
        </Link>
        <Link to="/legal/privacy" className="font-semibold hover:text-foreground">
          개인정보처리방침
        </Link>
        <Link to="/legal/business" className="hover:text-foreground">
          사업자정보
        </Link>
      </div>

      <p className="mt-3 text-[10px] text-muted-foreground/50">
        © {new Date().getFullYear()} SUGO. All rights reserved.
      </p>
    </footer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="whitespace-nowrap text-muted-foreground/80">{label}</dt>
      <dd className="text-foreground/80">{value}</dd>
    </>
  );
}
