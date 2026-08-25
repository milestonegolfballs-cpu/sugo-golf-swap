import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Search as SearchIcon, MapPin, ChevronDown, X } from "lucide-react";
import { CategoryBallIcon } from "@/components/icons/GolfBallIcons";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/layout/MobileShell";
import { ProductCard } from "@/components/listings/ProductCard";
import type { ListingPreview } from "@/components/listings/ListingCard";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const PAGE_SIZE = 12;
const COLS =
  "id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type, category";

type ListingKind = "all" | "sell" | "want";
type SortKey = "newest" | "price_asc" | "price_desc";

const REGIONS = [
  "전체 지역",
  "서울", "경기", "인천", "강원", "충북", "충남",
  "대전", "세종", "전북", "전남", "광주", "경북",
  "경남", "대구", "울산", "부산", "제주",
];

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "검색 — SUGO" }] }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [cat, setCat] = useState<CategorySlug | "all">("all");
  const [kind, setKind] = useState<ListingKind>("all");
  const [region, setRegion] = useState<string>("전체 지역");
  const [sort, setSort] = useState<SortKey>("newest");
  const [regionOpen, setRegionOpen] = useState(false);

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["search", debouncedQ, cat, kind, region, sort],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("listings")
        .select(COLS)
        .eq("is_active", true);

      if (cat !== "all") query = query.eq("category", cat);
      if (kind !== "all") query = query.eq("listing_type", kind);
      if (region !== "전체 지역") query = query.ilike("region", `${region}%`);

      if (debouncedQ) {
        const escaped = debouncedQ.replace(/[,()]/g, " ");
        const like = `%${escaped}%`;
        query = query.or(
          [
            `title.ilike.${like}`,
            `description.ilike.${like}`,
            `brand.ilike.${like}`,
            `manufacturer.ilike.${like}`,
          ].join(","),
        );
      }

      if (sort === "newest") query = query.order("created_at", { ascending: false });
      else if (sort === "price_asc") query = query.order("price", { ascending: true, nullsFirst: false });
      else query = query.order("price", { ascending: false, nullsFirst: false });

      query = query.range(from, to);
      const { data } = await query;
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

  const items = useMemo(() => data?.pages.flat() ?? [], [data]);

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
        {/* Search bar */}
        <div className="flex items-center gap-2 px-3 py-3">
          <Link to="/" className="grid h-10 w-10 place-items-center -ml-1" aria-label="뒤로">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-surface-strong px-4 py-2.5">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="찾는 골프공을 검색해보세요."
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
              enterKeyHint="search"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="grid h-6 w-6 place-items-center rounded-full bg-foreground/10 text-foreground/70"
                aria-label="지우기"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-3">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>전체</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              <CategoryBallIcon slug={c.slug} className="mr-1.5 h-4 w-4" />
              {c.label}
            </Chip>
          ))}
        </div>

        {/* Listing type + region + sort */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-3 py-3">
          <Chip active={kind === "all"} onClick={() => setKind("all")}>전체</Chip>
          <Chip active={kind === "sell"} onClick={() => setKind("sell")}>판매합니다</Chip>
          <Chip active={kind === "want"} onClick={() => setKind("want")}>구합니다</Chip>

          <div className="mx-1 h-4 w-px shrink-0 bg-border" />

          <Popover open={regionOpen} onOpenChange={setRegionOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  region !== "전체 지역"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white text-foreground"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                {region}
                <ChevronDown className="h-3 w-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-0">
              <Command>
                <CommandInput placeholder="지역 검색" />
                <CommandList>
                  <CommandEmpty>결과 없음</CommandEmpty>
                  <CommandGroup>
                    {REGIONS.map((r) => (
                      <CommandItem
                        key={r}
                        value={r}
                        onSelect={() => {
                          setRegion(r);
                          setRegionOpen(false);
                        }}
                      >
                        {r}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="ml-auto shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium"
          >
            <option value="newest">최신순</option>
            <option value="price_asc">가격 낮은순</option>
            <option value="price_desc">가격 높은순</option>
          </select>
        </div>
      </header>

      {/* Results */}
      {isLoading ? (
        <div className="px-4 py-20 text-center text-sm text-muted-foreground">
          검색 중...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-20 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-surface-strong">
            <SearchIcon className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/sell" })}
            className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground active:scale-[0.99]"
          >
            상품 등록하기
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 px-4 py-4">
            {items.map((l) => (
              <ProductCard key={l.id} listing={l} />
            ))}
          </div>
          <div ref={loadMoreRef} className="h-10" />
          {isFetchingNextPage && (
            <div className="pb-6 text-center text-xs text-muted-foreground">
              불러오는 중...
            </div>
          )}
        </>
      )}
    </MobileShell>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
