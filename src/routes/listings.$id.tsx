import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABEL, type CategorySlug } from "@/lib/categories";
import { formatKRW, timeAgo } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/listings/$id")({
  head: ({ params }) => ({ meta: [{ title: `상품 ${params.id} — SUGO` }] }),
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [photoIdx, setPhotoIdx] = useState(0);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select(
          "id, user_id, listing_type, category, title, description, region, brand, manufacturer, quantity, condition, price, price_per_ball, photos, created_at",
        )
        .eq("id", id)
        .maybeSingle();
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["listing-seller", listing?.user_id],
    enabled: !!listing?.user_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nickname, avatar_url, region")
        .eq("id", listing!.user_id)
        .maybeSingle();
      return data;
    },
  });

  const { data: fav } = useQuery({
    queryKey: ["fav", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id)
        .eq("listing_id", id)
        .maybeSingle();
      return !!data;
    },
  });

  useEffect(() => setPhotoIdx(0), [id]);

  async function toggleFav() {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: `/listings/${id}` } });
      return;
    }
    if (fav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, listing_id: id });
    }
    queryClient.invalidateQueries({ queryKey: ["fav", id] });
    queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
  }

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) return toast.error("삭제에 실패했어요");
    toast.success("삭제되었어요");
    navigate({ to: "/" });
  }

  if (isLoading) {
    return <div className="mx-auto max-w-md p-6 text-sm text-muted-foreground">불러오는 중...</div>;
  }
  if (!listing) {
    return (
      <div className="mx-auto max-w-md p-6 text-center text-sm text-muted-foreground">
        상품을 찾을 수 없어요.{" "}
        <Link to="/" className="text-primary">홈으로</Link>
      </div>
    );
  }

  const photos = listing.photos ?? [];
  const isOwner = user?.id === listing.user_id;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-28">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white/90 px-2 py-3 backdrop-blur">
        <Link to="/" className="grid h-10 w-10 place-items-center" aria-label="뒤로">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="mr-2 grid h-10 w-10 place-items-center text-destructive"
            aria-label="삭제"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </header>

      {/* Photos */}
      <div className="aspect-square bg-surface">
        {photos.length > 0 ? (
          <img
            src={photos[photoIdx]}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <div className="h-24 w-24 rounded-full border border-border bg-white shadow-inner" />
          </div>
        )}
      </div>
      {photos.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
          {photos.map((p, i) => (
            <button
              key={p}
              onClick={() => setPhotoIdx(i)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border ${
                photoIdx === i ? "border-primary" : "border-border"
              }`}
            >
              <img src={p} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-primary-soft px-2 py-0.5 font-bold text-primary">
            {listing.listing_type === "want" ? "구해요" : "판매"}
          </span>
          <span className="text-muted-foreground">
            {CATEGORY_LABEL[listing.category as CategorySlug]}
          </span>
        </div>
        <h1 className="mt-3 text-xl font-bold text-foreground">{listing.title}</h1>
        <p className="mt-2 text-2xl font-black text-foreground">
          {formatKRW(listing.price)}
        </p>
        {listing.price_per_ball ? (
          <p className="text-sm text-muted-foreground">
            개당 {formatKRW(listing.price_per_ball)}
          </p>
        ) : null}

        <dl className="mt-5 space-y-2 rounded-xl bg-surface p-4 text-sm">
          <Row label="수량" value={`${listing.quantity}개`} />
          {listing.brand && <Row label="브랜드" value={listing.brand} />}
          {listing.manufacturer && <Row label="제조사" value={listing.manufacturer} />}
          {listing.condition && <Row label="상태" value={`${listing.condition}급`} />}
          {listing.region && <Row label="지역" value={listing.region} />}
          <Row label="등록" value={timeAgo(listing.created_at)} />
        </dl>

        {listing.description && (
          <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {listing.description}
          </p>
        )}

        {profile && (
          <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-primary-soft text-sm font-bold text-primary">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (profile.nickname ?? "U").slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-medium text-foreground">{profile.nickname}</p>
              {profile.region && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {profile.region}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center gap-3 border-t border-border bg-white p-4 safe-bottom">
        <button
          onClick={toggleFav}
          className="grid h-12 w-12 place-items-center rounded-xl border border-border"
          aria-label="관심상품"
        >
          <Heart
            className={`h-6 w-6 ${fav ? "fill-destructive text-destructive" : "text-foreground"}`}
          />
        </button>
        <button className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground">
          판매자에게 연락하기
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
