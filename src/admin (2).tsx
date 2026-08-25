import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/layout/MobileShell";
import { ProductCard } from "@/components/listings/ProductCard";
import type { ListingPreview } from "@/components/listings/ListingCard";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";

const PAGE_SIZE = 12;
const COLS =
  "id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type, category";

type Search = { category?: CategorySlug };

export const Route = createFileRoute("/listings/")({
  head: () => ({ meta: [{ title: "상품 둘러보기 — SUGO" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    category:
      s.category === "new_practice" ||
      s.category === "used_practice" ||
      s.category === "lost_ball"
        ? s.category
        : undefined,
  }),
  component: ListingsPage,
});

function ListingsPage() {
  const { category } = Route.useSearch();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["listings-feed", category ?? "all"],
      initialPageParam: 0,
      queryFn: async ({ pageParam }) => {
        const from = pageParam * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        let q = supabase
          .from("listings")
          .select(COLS)
          .eq("is_active", true)
          .eq("listing_type", "sell")
          .order("created_at", { ascending: false })
          .range(from, to);
        if (category) q = q.eq("category", category);
        const { data } = await q;
        return (data ?? []) as ListingPreview[];
      },
      getNextPageParam: (last, all) =>
        last.length < PAGE_SIZE ? undefined : all.length,
    });

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = data?.pages.flat() ?? [];

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
        <div className="flex items-center gap-2 px-2 py-3">
          <Link to="/" className="grid h-10 w-10 place-items-center" aria-label="뒤로">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold">상품 둘러보기</h1>
        </div>
        <nav className="no-scrollbar flex gap-2 overflow-x-auto px-3 pb-3">
          <FilterChip to={{ search: {} }} active={!category} label="전체" />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.slug}
              to={{ search: { category: c.slug } }}
              active={category === c.slug}
              label={`${c.emoji} ${c.label}`}
            />
          ))}
        </nav>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        {items.map((l) => (
          <ProductCard key={l.id} listing={l} />
        ))}
      </div>

      {!isLoading && items.length === 0 && (
        <div className="px-4 py-20 text-center text-sm text-muted-foreground">
          아직 등록된 상품이 없어요.
        </div>
      )}

      <div ref={loadMoreRef} className="h-10" />
      {isFetchingNextPage && (
        <div className="pb-6 text-center text-xs text-muted-foreground">
          불러오는 중...
        </div>
      )}
    </MobileShell>
  );
}

function FilterChip({
  to,
  active,
  label,
}: {
  to: { search: Search };
  active: boolean;
  label: string;
}) {
  return (
    <Link
      to="/listings"
      search={to.search}
      className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold ring-1 transition ${
        active
          ? "bg-primary text-primary-foreground ring-primary"
          : "bg-white text-foreground ring-border"
      }`}
    >
      {label}
    </Link>
  );
}
