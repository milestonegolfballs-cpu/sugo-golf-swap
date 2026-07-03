import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, MapPin, Trash2, Store, User as UserIcon, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABEL, type CategorySlug } from "@/lib/categories";
import { formatKRW, timeAgo } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/listings/$id")({
  head: () => ({ meta: [{ title: "상품 상세 — SUGO" }] }),
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);

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

  const { data: sellerCount = 0 } = useQuery({
    queryKey: ["seller-count", listing?.user_id],
    enabled: !!listing?.user_id,
    queryFn: async () => {
      const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", listing!.user_id)
        .eq("is_active", true);
      return count ?? 0;
    },
  });

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

  const photos = (listing.photos ?? []).slice(0, 10);
  const isOwner = user?.id === listing.user_id;
  const category = listing.category as CategorySlug;
  // Simple heuristic — no seller_type in schema; treat everyone as 개인 for now.
  const sellerType: "개인" | "업체" = "개인";

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) return toast.error("삭제에 실패했어요");
    toast.success("삭제되었어요");
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-28">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white/85 px-2 py-2.5 backdrop-blur">
        <button
          onClick={() => navigate({ to: "/" })}
          className="grid h-10 w-10 place-items-center"
          aria-label="뒤로"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="mr-1 grid h-10 w-10 place-items-center text-destructive"
            aria-label="삭제"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </header>

      {/* Gallery */}
      <div className="px-4">
        <Gallery photos={photos} title={listing.title} />
      </div>

      {/* Info */}
      <section className="px-5 pt-5">
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <span className="rounded-full bg-primary-soft px-2.5 py-1 font-bold text-primary">
            {listing.listing_type === "want" ? "구합니다" : "판매합니다"}
          </span>
          <span className="rounded-full bg-surface px-2.5 py-1 text-muted-foreground">
            {CATEGORY_LABEL[category]}
          </span>
        </div>

        <h1 className="mt-4 text-[22px] font-bold leading-tight tracking-tight text-foreground">
          {listing.title}
        </h1>

        <p className="mt-3 text-[28px] font-black tracking-tight text-foreground">
          {formatKRW(listing.price)}
        </p>

        {/* Category-specific attributes */}
        <div className="mt-5 rounded-2xl border border-border/70 bg-white p-4">
          <CategoryAttributes listing={listing} category={category} />
        </div>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {listing.region && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {listing.region}
            </span>
          )}
          <span>{timeAgo(listing.created_at)}</span>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="mt-6 rounded-2xl bg-surface p-5">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
              {listing.description}
            </p>
          </div>
        )}
      </section>

      {/* Seller */}
      <section className="mx-5 mt-6 rounded-2xl border border-border/70 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-primary-soft text-base font-bold text-primary">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              (profile?.nickname ?? "U").slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[15px] font-semibold text-foreground">
                {profile?.nickname ?? "판매자"}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {sellerType === "업체" ? (
                  <Store className="h-3 w-3" />
                ) : (
                  <UserIcon className="h-3 w-3" />
                )}
                {sellerType}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              등록 상품 {sellerCount}개
              {profile?.region ? ` · ${profile.region}` : ""}
            </p>
          </div>
        </div>
        <Link
          to="/search"
          className="mt-4 flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm font-medium text-foreground active:scale-[0.99]"
        >
          판매자의 다른 상품 보기
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center gap-3 border-t border-border bg-white/95 p-4 backdrop-blur safe-bottom">
        <div className="grid h-12 w-12 place-items-center">
          <FavoriteButton listingId={listing.id} />
        </div>
        <button
          onClick={() => setContactOpen(true)}
          className="flex-1 rounded-2xl bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-soft active:scale-[0.99]"
        >
          문의하기
        </button>
      </div>

      <ContactDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        sellerName={profile?.nickname ?? "판매자"}
        listingTitle={listing.title}
      />
    </div>
  );
}

function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false });
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const on = () => setIdx(embla.selectedScrollSnap());
    embla.on("select", on);
    on();
    return () => {
      embla.off("select", on);
    };
  }, [embla]);

  if (photos.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-3xl bg-surface">
        <div className="grid h-full w-full place-items-center">
          <div className="h-24 w-24 rounded-full border border-border bg-white shadow-inner" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl bg-surface" ref={emblaRef}>
        <div className="flex">
          {photos.map((src, i) => (
            <div key={src + i} className="min-w-0 shrink-0 grow-0 basis-full">
              <div className="aspect-square w-full">
                <img
                  src={src}
                  alt={`${title} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {photos.length > 1 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
          {idx + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

type ListingLite = {
  brand: string | null;
  manufacturer: string | null;
  quantity: number;
  price: number | null;
  price_per_ball: number | null;
  title: string;
};

function CategoryAttributes({
  listing,
  category,
}: {
  listing: ListingLite;
  category: CategorySlug;
}) {
  if (category === "used_practice") {
    return (
      <Attrs
        rows={[
          ["수량", `${listing.quantity}개`],
          ["개당 가격", formatKRW(listing.price_per_ball)],
          ["총 가격", formatKRW(listing.price)],
        ]}
      />
    );
  }
  if (category === "new_practice") {
    return (
      <Attrs
        rows={[
          ["제조사", listing.manufacturer ?? "-"],
          ["제품명", listing.title],
          ["수량", `${listing.quantity}개`],
          ["개당 가격", formatKRW(listing.price_per_ball)],
          ["총 가격", formatKRW(listing.price)],
        ]}
      />
    );
  }
  // lost_ball
  return (
    <Attrs
      rows={[
        ["브랜드", listing.brand ?? "-"],
        ["모델", listing.title],
        ["수량", `${listing.quantity}개`],
        ["가격", formatKRW(listing.price)],
      ]}
    />
  );
}

function Attrs({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-border/70 text-sm">
      {rows.map(([k, v], i) => (
        <div key={k} className={`flex justify-between ${i === 0 ? "pb-2.5" : "py-2.5"} last:pb-0`}>
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="max-w-[60%] truncate text-right font-medium text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function ContactDialog({
  open,
  onOpenChange,
  sellerName,
  listingTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sellerName: string;
  listingTitle: string;
}) {
  const [msg, setMsg] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92%] rounded-3xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{sellerName}님에게 문의</DialogTitle>
          <DialogDescription className="line-clamp-1">{listingTitle}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="궁금한 점을 남겨주세요. 예) 재고 있나요? 직거래 가능한가요?"
          className="min-h-[120px] rounded-2xl"
        />
        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl sm:flex-none"
          >
            취소
          </Button>
          <Button
            onClick={() => {
              if (!msg.trim()) return toast.error("문의 내용을 입력해주세요");
              toast.success("문의가 전송되었어요");
              setMsg("");
              onOpenChange(false);
            }}
            className="flex-1 rounded-xl sm:flex-none"
          >
            보내기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
