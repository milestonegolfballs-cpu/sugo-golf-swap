import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Mail } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/legal/faq")({
  head: () => ({
    meta: [
      { title: "자주 묻는 질문 — SUGO" },
      { name: "description", content: "SUGO 이용 중 자주 묻는 질문을 모아두었습니다." },
      { property: "og:title", content: "FAQ — SUGO" },
      { property: "og:description", content: "SUGO 이용 중 자주 묻는 질문을 모아두었습니다." },
    ],
  }),
  component: FaqPage,
});

const CATEGORIES: {
  id: string;
  title: string;
  items: { q: string; a: string }[];
}[] = [
  {
    id: "account",
    title: "계정",
    items: [
      {
        q: "가입은 어떻게 하나요?",
        a: "홈 우측 상단의 로그인 버튼을 누른 후 회원가입을 선택하세요. 이메일과 닉네임, 지역을 입력하면 바로 이용할 수 있습니다.",
      },
      {
        q: "비밀번호를 잊어버렸어요.",
        a: "로그인 화면의 '비밀번호 찾기'를 눌러 가입한 이메일을 입력하시면 재설정 링크를 보내드립니다.",
      },
      {
        q: "닉네임을 바꾸고 싶어요.",
        a: "마이페이지 > 프로필 편집에서 언제든지 닉네임을 변경할 수 있습니다.",
      },
    ],
  },
  {
    id: "sell",
    title: "판매",
    items: [
      {
        q: "상품은 어떻게 등록하나요?",
        a: "하단 네비게이션의 '판매' 버튼을 눌러 사진, 제목, 브랜드, 가격을 입력하면 등록이 완료됩니다.",
      },
      {
        q: "골프공 외 다른 상품도 팔 수 있나요?",
        a: "아니요. SUGO는 골프공 전용 마켓입니다. 다른 상품은 등록이 제한됩니다.",
      },
      {
        q: "수수료가 있나요?",
        a: "회원 간 거래에는 별도의 수수료가 부과되지 않습니다.",
      },
    ],
  },
  {
    id: "buy",
    title: "구매",
    items: [
      {
        q: "찜한 상품은 어디서 보나요?",
        a: "마이페이지의 '찜한 상품' 탭에서 저장한 상품을 확인할 수 있습니다.",
      },
      {
        q: "판매자에게 어떻게 연락하나요?",
        a: "상품 상세 페이지의 '문의하기' 버튼을 누르면 판매자와 1:1 채팅을 시작할 수 있습니다.",
      },
    ],
  },
  {
    id: "trouble",
    title: "문제 해결",
    items: [
      {
        q: "사기가 의심돼요.",
        a: "즉시 채팅방이나 상품 페이지의 신고 버튼을 이용해주세요. 접수된 신고는 24시간 이내에 검토됩니다.",
      },
      {
        q: "회원 탈퇴는 어떻게 하나요?",
        a: "마이페이지 > 설정에서 회원 탈퇴가 가능합니다. 탈퇴 시 모든 데이터는 즉시 삭제됩니다.",
      },
    ],
  },
];

function FaqPage() {
  return (
    <MobileShell>
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-white/85 px-4 py-3 backdrop-blur">
        <Link
          to="/me"
          className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
          aria-label="뒤로"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="text-[15px] font-semibold text-foreground">FAQ</span>
      </div>

      <article className="px-5 pb-16 pt-6">
        <header className="border-b border-border pb-6">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-foreground">
            자주 묻는 질문
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            마지막 업데이트 · 2026년 7월 7일
          </p>
        </header>

        <nav aria-label="목차" className="mt-6 rounded-2xl bg-muted/60 px-5 py-4">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            목차
          </p>
          <ol className="mt-2 space-y-1.5">
            {CATEGORIES.map((c, i) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  className="text-[14px] text-foreground/80 transition hover:text-primary"
                >
                  {String(i + 1).padStart(2, "0")}. {c.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8 space-y-10">
          {CATEGORIES.map((cat, i) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-20">
              <h2 className="text-[18px] font-bold tracking-tight text-foreground">
                {i + 1}. {cat.title}
              </h2>
              <Accordion type="single" collapsible className="mt-3">
                {cat.items.map((it, j) => (
                  <AccordionItem
                    key={j}
                    value={`${cat.id}-${j}`}
                    className="border-b border-border last:border-b-0"
                  >
                    <AccordionTrigger className="py-4 text-left text-[15px] font-medium text-foreground hover:no-underline">
                      {it.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-[14px] leading-[1.75] text-muted-foreground">
                      {it.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-border bg-muted/40 px-5 py-6">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                원하는 답변이 없나요?
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                아래 이메일로 문의해주세요. 최대한 빠르게 답변드릴게요.
              </p>
              <a
                href="mailto:support@sugo.golf"
                className="mt-3 inline-flex items-center rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition active:scale-[0.98]"
              >
                support@sugo.golf
              </a>
            </div>
          </div>
        </section>
      </article>
    </MobileShell>
  );
}
