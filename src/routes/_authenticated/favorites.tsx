import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/layout/MobileShell";
import { ListingCardHorizontal, type ListingPreview } from "@/components/listings/ListingCard";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({ meta: [{ title: "관심상품 — SUGO" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = Route.useRouteContext();
  const { data: items = [] } = useQuery({
    queryKey: ["favorites", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select(
          "listing:listings(id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type, category)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data ?? []).map((r) => r.listing as unknown as ListingPreview).filter(Boolean);
    },
  });

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-white px-2 py-3">
        <Link to="/" className="grid h-10 w-10 place-items-center" aria-label="뒤로">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">관심상품</h1>
      </header>

      {items.length === 0 ? (
        <div className="px-6 py-20 text-center text-sm text-muted-foreground">
          아직 관심상품이 없어요.
          <br />
          마음에 드는 상품에 하트를 눌러보세요.
        </div>
      ) : (
        <div className="space-y-4 px-4 py-4">
          {items.map((l) => (
            <ListingCardHorizontal key={l.id} listing={l} />
          ))}
        </div>
      )}
    </MobileShell>
  );
}
