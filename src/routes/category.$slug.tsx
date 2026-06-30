import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/layout/MobileShell";
import {
  ListingCardHorizontal,
  type ListingPreview,
} from "@/components/listings/ListingCard";
import { CATEGORY_LABEL, type CategorySlug } from "@/lib/categories";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${CATEGORY_LABEL[params.slug as CategorySlug] ?? "카테고리"} — SUGO`,
      },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const label = CATEGORY_LABEL[slug as CategorySlug] ?? "카테고리";

  const { data = [] } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select(
          "id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type",
        )
        .eq("category", slug as CategorySlug)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(60);
      return (data ?? []) as ListingPreview[];
    },
  });

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-white px-2 py-3">
        <Link to="/" className="grid h-10 w-10 place-items-center" aria-label="뒤로">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">{label}</h1>
      </header>

      <div className="space-y-4 px-4 py-4">
        {data.length === 0 ? (
          <div className="px-2 py-20 text-center text-sm text-muted-foreground">
            아직 등록된 상품이 없어요.
          </div>
        ) : (
          data.map((l) => <ListingCardHorizontal key={l.id} listing={l} />)
        )}
      </div>
    </MobileShell>
  );
}
