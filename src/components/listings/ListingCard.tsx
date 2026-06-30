import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { formatKRW, timeAgo } from "@/lib/format";
import { CATEGORY_LABEL, type CategorySlug } from "@/lib/categories";
import { FavoriteButton } from "./FavoriteButton";

export type ListingPreview = {
  id: string;
  title: string;
  price: number | null;
  price_per_ball: number | null;
  quantity: number | null;
  region: string | null;
  brand: string | null;
  photos: string[] | null;
  created_at: string;
  listing_type?: string;
  category?: CategorySlug;
};

function Thumbnail({ src, alt }: { src?: string | null; alt: string }) {
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
      <div className="h-10 w-10 rounded-full border border-border bg-white shadow-inner" />
    </div>
  );
}

function CategoryTag({ category }: { category?: CategorySlug }) {
  if (!category) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
      {CATEGORY_LABEL[category]}
    </span>
  );
}

export function ListingCardVertical({ listing }: { listing: ListingPreview }) {
  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="block min-w-[170px] flex-shrink-0"
    >
      <div className="relative mb-2 aspect-square overflow-hidden rounded-2xl bg-surface shadow-soft">
        <Thumbnail src={listing.photos?.[0]} alt={listing.title} />
        <div className="absolute right-2 top-2">
          <FavoriteButton listingId={listing.id} size="sm" />
        </div>
      </div>
      <div className="mb-1">
        <CategoryTag category={listing.category} />
      </div>
      <p className="line-clamp-1 text-sm font-medium text-foreground">
        {listing.title}
      </p>
      <p className="mt-0.5 text-base font-bold text-foreground">
        {formatKRW(listing.price)}
      </p>
      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
        {listing.quantity ? `${listing.quantity}개` : "수량 미지정"}
        {listing.region ? ` · ${listing.region}` : ""}
      </p>
    </Link>
  );
}

export function ListingCardHorizontal({ listing }: { listing: ListingPreview }) {
  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
        <Thumbnail src={listing.photos?.[0]} alt={listing.title} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CategoryTag category={listing.category} />
            <p className="mt-1 line-clamp-1 text-sm font-medium text-foreground">
              {listing.title}
            </p>
          </div>
          <FavoriteButton listingId={listing.id} size="sm" />
        </div>
        <p className="mt-1 text-base font-bold text-foreground">
          {formatKRW(listing.price)}
        </p>
        <div className="mt-auto flex items-center gap-2 text-[11px] text-muted-foreground">
          {listing.region ? (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {listing.region}
            </span>
          ) : null}
          {listing.quantity ? <span>· {listing.quantity}개</span> : null}
          <span className="ml-auto">{timeAgo(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

export function WantedChip({ listing }: { listing: ListingPreview }) {
  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="block min-w-[240px] flex-shrink-0 rounded-2xl border border-border bg-white p-4 shadow-soft"
    >
      <span className="inline-flex items-center rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-white">
        구해요
      </span>
      <p className="mt-2 line-clamp-1 text-sm font-medium text-foreground">
        {listing.title}
      </p>
      <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
        {listing.region ?? "지역 무관"}
        {listing.quantity ? ` · ${listing.quantity}개` : ""}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-bold text-primary">
          {formatKRW(listing.price)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {timeAgo(listing.created_at)}
        </span>
      </div>
    </Link>
  );
}
