import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, ChevronRight } from "lucide-react";
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
  "id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type";

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
          <div className="flex items-center gap-3 text-foreground">
            <Link to="/search" aria-label="검색">
              <Search className="h-6 w-6" strokeWidth={1.8} />
            </Link>
            <button aria-label="알림">
              <Bell className="h-6 w-6" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary px-6 py-7 text-primary-foreground">
        <h1 className="text-[22px] font-bold leading-tight">
          수고한 골프공의
          <br />
          새로운 시작
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
          골프공을 사고, 팔고,
          <br />
          다시 연결하세요.
        </p>
      </section>

      {/* Categories */}
      <section className="grid grid-cols-3 gap-3 px-4 py-5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className="flex flex-col items-center gap-2"
          >
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-2xl transition-transform active:scale-95">
              {c.emoji}
            </div>
            <span className="text-[12px] font-medium text-foreground">{c.label}</span>
          </Link>
        ))}
      </section>

      {/* Wanted CTA */}
      <Link
        to="/sell"
        className="mx-4 flex items-center justify-between rounded-xl bg-foreground p-4 text-white"
      >
        <div>
          <h3 className="text-sm font-bold">📢 지금 필요한 공이 있나요?</h3>
          <p className="mt-0.5 text-xs text-white/70">구해요 게시판에 글을 남겨보세요</p>
        </div>
        <ChevronRight className="h-5 w-5" />
      </Link>

      {/* 구해요 row */}
      {wanted.length > 0 && (
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between px-4">
            <h3 className="font-bold text-foreground">📢 구해요</h3>
            <Link to="/search" className="text-xs text-muted-foreground">
              전체보기
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
            {wanted.map((l) => (
              <WantedChip key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between px-4">
          <h3 className="font-bold text-foreground">🔥 추천 상품</h3>
          <Link to="/search" className="text-xs text-muted-foreground">
            전체보기
          </Link>
        </div>
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
        <div className="mb-3 flex items-center justify-between px-4">
          <h3 className="font-bold text-foreground">🆕 최근 등록 상품</h3>
        </div>
        {recent.length > 0 ? (
          <div className="space-y-4 px-4">
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

function EmptyHint() {
  return (
    <div className="mx-4 rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
      아직 등록된 상품이 없어요.
      <br />첫 번째 판매자가 되어보세요.
    </div>
  );
}
