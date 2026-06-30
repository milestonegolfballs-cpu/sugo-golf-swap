import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/layout/MobileShell";
import {
  ListingCardHorizontal,
  type ListingPreview,
} from "@/components/listings/ListingCard";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "검색 — SUGO" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategorySlug | "all">("all");

  const { data = [] } = useQuery({
    queryKey: ["search", q, cat],
    queryFn: async () => {
      let query = supabase
        .from("listings")
        .select(
          "id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type, category",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(40);
      if (cat !== "all") query = query.eq("category", cat);
      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);
      const { data } = await query;
      return (data ?? []) as ListingPreview[];
    },
  });

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 border-b border-border bg-white px-3 py-3">
        <div className="flex items-center gap-2">
          <Link to="/" className="grid h-10 w-10 place-items-center" aria-label="뒤로">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex flex-1 items-center gap-2 rounded-full bg-surface-strong px-4 py-2">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="브랜드, 모델, 키워드로 검색"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>
            전체
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              {c.emoji} {c.label}
            </Chip>
          ))}
        </div>
      </header>

      <div className="space-y-4 px-4 py-4">
        {data.length === 0 ? (
          <div className="px-2 py-16 text-center text-sm text-muted-foreground">
            검색 결과가 없어요.
          </div>
        ) : (
          data.map((l) => <ListingCardHorizontal key={l.id} listing={l} />)
        )}
      </div>
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
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
