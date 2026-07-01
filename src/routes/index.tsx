import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/layout/MobileShell";
import {
  ListingCardVertical,
  ListingCardHorizontal,
  WantedChip,
  type ListingPreview,
} from "@/components/listings/ListingCard";
import { CATEGORIES } from "@/lib/categories";
import { SugoLogo } from "@/components/brand/SugoLogo";
import { CategoryBallIcon } from "@/components/icons/GolfBallIcons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SUGO — 골프공 마켓플레이스" },
      {
        name: "description",
        content: "신품, 중고, 로스트볼까지. SUGO에서 골프공을 사고팔아 보세요.",
      },
      { property: "og:title", content: "SUGO — 골프공 마켓플레이스" },
      {
        property: "og:description",
        content: "골프공을 사고, 팔고, 다시 연결하세요.",
      },
    ],
  }),
  component: HomePage,
});

const COLS =
  "id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type, category";

async function fetchHomeData() {
  const [wanted, recommended, recent] = await Promise.all([
    supabase
      .from("listings")
      .select(COLS)
      .eq("listing_type", "want")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("listings")
      .select(COLS)
      .eq("listing_type", "sell")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("listings")
      .select(COLS)
      .eq("listing_type", "sell")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  return {
    wanted: (wanted.data ?? []) as ListingPreview[],
    recommended: (recommended.data ?? []) as ListingPreview[],
    recent: (recent.data ?? []) as ListingPreview[],
  };
}

function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data } = useQuery({ queryKey: ["home"], queryFn: fetchHomeData });
  const wanted = data?.wanted ?? [];
  const recommended = data?.recommended ?? [];
  const recent = data?.recent ?? [];

  return (
    <MobileShell>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="SUGO 홈">
            <SugoLogo size="md" />
          </Link>
          <Link
            to="/search"
            aria-label="검색"
            className="grid h-10 w-10 place-items-center rounded-full text-foreground"
          >
            <Search className="h-5 w-5" strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 pb-6 pt-7">
        <h1 className="text-[28px] font-bold leading-[1.2] tracking-tight text-foreground">
          수고한 골프공의
          <br />
          <span className="text-primary">새로운 시작</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          골프공을 사고, 팔고,
          <br />
          다시 연결하세요.
        </p>

        {/* Large search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/search" });
          }}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3.5 shadow-soft ring-1 ring-border focus-within:ring-primary"
        >
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.8} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="찾는 골프공을 검색해보세요."
            className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="검색"
          />
        </form>
      </section>

      {/* Categories — 3 large rounded cards */}
      <section className="grid grid-cols-3 gap-3 px-4 pb-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className="group flex flex-col items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-border transition active:scale-[0.98]"
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft">
              <CategoryBallIcon slug={c.slug} />
            </div>
            <span className="text-center text-[12px] font-semibold leading-tight text-foreground">
              {c.label}
            </span>
          </Link>
        ))}
      </section>

      {/* Wanted CTA */}
      <Link
        to="/sell"
        className="mx-4 mt-5 flex items-center justify-between rounded-2xl bg-foreground p-4 text-white shadow-soft"
      >
        <div>
          <h3 className="text-sm font-bold">📢 지금 필요한 공이 있나요?</h3>
          <p className="mt-0.5 text-xs text-white/70">구해요 게시판에 글을 남겨보세요</p>
        </div>
        <ChevronRight className="h-5 w-5" />
      </Link>

      {/* 구해요 row */}
      {wanted.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="📢 구해요" />
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
            {wanted.map((l) => (
              <WantedChip key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended */}
      <section className="mt-8">
        <SectionHeader title="🔥 추천 상품" />
        {recommended.length > 0 ? (
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
            {recommended.map((l) => (
              <ListingCardVertical key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyHint />
        )}
      </section>

      {/* Recent */}
      <section className="mt-8">
        <SectionHeader title="🆕 최근 등록 상품" hideMore />
        {recent.length > 0 ? (
          <div className="space-y-3 px-4">
            {recent.map((l) => (
              <ListingCardHorizontal key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyHint />
        )}
      </section>

      <div className="h-10" />
    </MobileShell>
  );
}

function SectionHeader({ title, hideMore }: { title: string; hideMore?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between px-4">
      <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
      {!hideMore && (
        <Link to="/listings" className="text-xs text-muted-foreground">
          전체보기
        </Link>
      )}
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="mx-4 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
      아직 등록된 상품이 없어요.
      <br />첫 번째 판매자가 되어보세요.
    </div>
  );
}
