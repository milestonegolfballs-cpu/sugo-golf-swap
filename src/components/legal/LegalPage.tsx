import { Link } from "@tanstack/react-router";
import { ChevronLeft, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { MobileShell } from "@/components/layout/MobileShell";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export function LegalPage({
  title,
  lastUpdated,
  sections,
  intro,
  extra,
}: {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
  intro?: ReactNode;
  extra?: ReactNode;
}) {
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
        <span className="text-[15px] font-semibold text-foreground">{title}</span>
      </div>

      <article className="px-5 pb-16 pt-6">
        <header className="border-b border-border pb-6">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            마지막 업데이트 · {lastUpdated}
          </p>
          {intro ? (
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              {intro}
            </p>
          ) : null}
        </header>

        {sections.length > 0 && (
          <nav
            aria-label="목차"
            className="mt-6 rounded-2xl bg-muted/60 px-5 py-4"
          >
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              목차
            </p>
            <ol className="mt-2 space-y-1.5">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-[14px] text-foreground/80 transition hover:text-primary"
                  >
                    {String(i + 1).padStart(2, "0")}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="mt-8 space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <h2 className="text-[18px] font-bold tracking-tight text-foreground">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-[1.75] text-foreground/85">
                {s.content}
              </div>
            </section>
          ))}
        </div>

        {extra ? <div className="mt-10">{extra}</div> : null}

        <ContactBlock />
      </article>
    </MobileShell>
  );
}

function ContactBlock() {
  return (
    <section className="mt-12 rounded-2xl border border-border bg-muted/40 px-5 py-6">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-foreground">
            궁금한 점이 있으신가요?
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            정책 관련 문의는 아래로 연락해주세요.
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
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 marker:text-muted-foreground">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
