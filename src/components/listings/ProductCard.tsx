import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { formatKRW, timeAgo } from "@/lib/format";
import { CATEGORY_LABEL, type CategorySlug } from "@/lib/categories";
import { FavoriteButton } from "./FavoriteButton";
import type { ListingPreview } from "./ListingCard";

function Thumb({ src, alt }: { src?: string | null; alt: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-strong">
      <div className="h-12 w-12 rounded-full border border-border bg-white shadow-inner" />
    </div>
  );
}

function Meta({ listing }: { listing: ListingPreview }) {
  return (
    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
      {listing.region && (
        <span className="inline-flex items-center gap-0.5">
          <MapPin className="h-3 w-3" />
          {listing.region}
        </span>
      )}
      <span className="ml-auto">{timeAgo(listing.created_at)}</span>
    </div>
  );
}

function Tag({ category }: { category?: CategorySlug }) {
  if (!category) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
      {CATEGORY_LABEL[category]}
    </span>
  );
}

/** Card layout dispatched by category. */
export function ProductCard({ listing }: { listing: ListingPreview }) {
  const category = listing.category;
  if (category === "used_practice") return <UsedPracticeCard listing={listing} />;
  if (category === "lost_ball") return <LostBallCard listing={listing} />;
  return <NewPracticeCard listing={listing} />;
}

/** 신품 연습공 — clean, price-forward */
function NewPracticeCard({ listing }: { listing: ListingPreview }) {
  return (
    <CardShell listing={listing}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Tag category={listing.category} />
          <p className="mt-1.5 line-clamp-1 text-[14px] font-semibold text-foreground">
            {listing.title}
          </p>
          {listing.brand && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
              {listing.brand}
            </p>
          )}
        </div>
      </div>
      <p className="mt-2 text-[17px] font-bold text-foreground">
        {formatKRW(listing.price)}
      </p>
      <p className="text-[11px] text-muted-foreground">
        {listing.quantity ? `${listing.quantity}개` : "수량 미지정"}
      </p>
      <Meta listing={listing} />
    </CardShell>
  );
}

/** 중고 연습공 — quantity + per-ball + total */
function UsedPracticeCard({ listing }: { listing: ListingPreview }) {
  return (
    <CardShell listing={listing}>
      <Tag category={listing.category} />
      <p className="mt-1.5 line-clamp-1 text-[14px] font-semibold text-foreground">
        {listing.title}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-surface p-2">
        <Stat label="수량" value={listing.quantity ? `${listing.quantity}개` : "-"} />
        <Stat label="개당" value={listing.price_per_ball ? formatKRW(listing.price_per_ball) : "-"} />
        <Stat label="총" value={formatKRW(listing.price)} strong />
      </div>
      <Meta listing={listing} />
    </CardShell>
  );
}

/** 로스트볼 — brand-forward */
function LostBallCard({ listing }: { listing: ListingPreview }) {
  return (
    <CardShell listing={listing}>
      <div className="flex items-center gap-1.5">
        <Tag category={listing.category} />
        {listing.brand && (
          <span className="inline-flex items-center rounded-full bg-foreground/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            {listing.brand}
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-1 text-[14px] font-semibold text-foreground">
        {listing.title}
      </p>
      <p className="mt-2 text-[17px] font-bold text-foreground">
        {formatKRW(listing.price)}
      </p>
      <p className="text-[11px] text-muted-foreground">
        {listing.quantity ? `${listing.quantity}개` : "수량 미지정"}
      </p>
      <Meta listing={listing} />
    </CardShell>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`truncate text-[12px] ${strong ? "font-bold text-primary" : "font-medium text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function CardShell({
  listing,
  children,
}: {
  listing: ListingPreview;
  children: React.ReactNode;
}) {
  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="block overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-border/60 transition active:scale-[0.99]"
    >
      <div className="relative aspect-square bg-surface">
        <Thumb src={listing.photos?.[0]} alt={listing.title} />
        <div className="absolute right-2 top-2">
          <FavoriteButton listingId={listing.id} size="sm" />
        </div>
      </div>
      <div className="p-3">{children}</div>
    </Link>
  );
}
