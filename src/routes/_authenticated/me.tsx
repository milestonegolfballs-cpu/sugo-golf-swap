import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/layout/MobileShell";
import { ListingCardHorizontal, type ListingPreview } from "@/components/listings/ListingCard";
import { ArrowLeft, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/me")({
  head: () => ({ meta: [{ title: "내 정보 — SUGO" }] }),
  component: MePage,
});

function MePage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nickname, avatar_url, region")
        .eq("id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: myListings = [] } = useQuery({
    queryKey: ["my-listings", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select(
          "id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type, category",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as ListingPreview[];
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-white px-2 py-3">
        <div className="flex items-center gap-2">
          <Link to="/" className="grid h-10 w-10 place-items-center" aria-label="뒤로">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold">내 정보</h1>
        </div>
        <button
          onClick={signOut}
          className="mr-2 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <LogOut className="h-4 w-4" /> 로그아웃
        </button>
      </header>

      <section className="flex items-center gap-4 px-5 py-6">
        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-primary-soft text-xl font-bold text-primary">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            (profile?.nickname ?? user.email ?? "U").slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-foreground">
            {profile?.nickname ?? user.email}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          {profile?.region && (
            <p className="mt-0.5 text-xs text-muted-foreground">📍 {profile.region}</p>
          )}
        </div>
      </section>

      <section className="px-5">
        <h2 className="mb-3 text-sm font-bold text-foreground">내가 올린 상품</h2>
        {myListings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
            아직 등록한 상품이 없어요.
          </div>
        ) : (
          <div className="space-y-4">
            {myListings.map((l) => (
              <ListingCardHorizontal key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </MobileShell>
  );
}
