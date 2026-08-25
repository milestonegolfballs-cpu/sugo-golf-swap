import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Megaphone, Mail } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";

export const Route = createFileRoute("/legal/notices")({
  head: () => ({
    meta: [
      { title: "공지사항 — SUGO" },
      { name: "description", content: "SUGO의 최신 공지사항을 확인하세요." },
      { property: "og:title", content: "공지사항 — SUGO" },
      { property: "og:description", content: "SUGO의 최신 공지사항을 확인하세요." },
    ],
  }),
  component: NoticesPage,
});

type Notice = {
  id: string;
  date: string;
  tag: "업데이트" | "안내" | "이벤트" | "점검";
  title: string;
  body: string;
};

const NOTICES: Notice[] = [
  {
    id: "n-2026-07-07",
    date: "2026.07.07",
    tag: "업데이트",
    title: "실시간 채팅 기능이 추가되었어요",
    body: "이제 판매자와 구매자가 앱 안에서 바로 대화할 수 있습니다. 상품 상세 페이지의 '문의하기' 버튼을 눌러보세요.",
  },
  {
    id: "n-2026-06-20",
    date: "2026.06.20",
    tag: "안내",
    title: "판매 금지 품목 정책이 개정되었습니다",
    body: "골프공 이외 상품의 등록이 전면 제한됩니다. 자세한 내용은 '판매 금지 품목' 페이지를 확인해주세요.",
  },
  {
    id: "n-2026-06-01",
    date: "2026.06.01",
    tag: "이벤트",
    title: "첫 판매 완료 시 축하 배지 지급",
    body: "첫 거래를 성공적으로 마친 회원에게 프로필 배지를 드립니다. 지금 상품을 등록해보세요.",
  },
  {
    id: "n-2026-05-15",
    date: "2026.05.15",
    tag: "점검",
    title: "정기 서버 점검 안내",
    body: "5월 20일 02:00 ~ 04:00 (KST) 서비스가 일시 중단됩니다. 이용에 참고해주세요.",
  },
  {
    id: "n-2026-05-01",
    date: "2026.05.01",
    tag: "안내",
    title: "SUGO가 정식 출시되었습니다",
    body: "골프공 전용 마켓 SUGO의 정식 서비스를 시작합니다. 많은 관심 부탁드립니다.",
  },
];

const TAG_STYLE: Record<Notice["tag"], string> = {
  업데이트: "bg-primary/10 text-primary",
  안내: "bg-blue-500/10 text-blue-600",
  이벤트: "bg-amber-500/10 text-amber-600",
  점검: "bg-muted text-muted-foreground",
};

function NoticesPage() {
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
        <span className="text-[15px] font-semibold text-foreground">공지사항</span>
      </div>

      <article className="px-5 pb-16 pt-6">
        <header className="border-b border-border pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary">
            <Megaphone className="h-3.5 w-3.5" />
            SUGO Notice
          </div>
          <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-foreground">
            공지사항
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            마지막 업데이트 · 2026년 7월 7일
          </p>
        </header>

        <ul className="mt-6 space-y-3">
          {NOTICES.map((n) => (
            <li key={n.id}>
              <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TAG_STYLE[n.tag]}`}
                  >
                    {n.tag}
                  </span>
                  <time className="text-[12px] text-muted-foreground">{n.date}</time>
                </div>
                <h2 className="mt-2 text-[16px] font-bold leading-snug text-foreground">
                  {n.title}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {n.body}
                </p>
              </article>
            </li>
          ))}
        </ul>

        <section className="mt-10 rounded-2xl border border-border bg-muted/40 px-5 py-6">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                더 궁금한 점이 있으신가요?
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                운영팀에 직접 문의해주세요.
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
