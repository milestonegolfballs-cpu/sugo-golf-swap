import { Link } from "@tanstack/react-router";
import { formatKRW, timeAgo } from "@/lib/format";

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

export function ListingCardVertical({ listing }: { listing: ListingPreview }) {
  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="block min-w-[150px] flex-shrink-0"
    >
      <div className="mb-2 aspect-square overflow-hidden rounded-xl bg-surface">
        <Thumbnail src={listing.photos?.[0]} alt={listing.title} />
      </div>
      <p className="line-clamp-1 text-xs font-medium text-foreground">
        {listing.title}
      </p>
      <p className="mt-0.5 text-sm font-bold text-foreground">
        {formatKRW(listing.price)}
      </p>
      {listing.price_per_ball ? (
        <p className="text-[11px] text-muted-foreground">
          개당 {formatKRW(listing.price_per_ball)}
        </p>
      ) : null}
    </Link>
  );
}

export function ListingCardHorizontal({ listing }: { listing: ListingPreview }) {
  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="flex gap-3"
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
        <Thumbnail src={listing.photos?.[0]} alt={listing.title} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="line-clamp-1 text-sm text-foreground">{listing.title}</p>
        <p className="text-xs text-muted-foreground">
          {listing.region ?? "지역 미지정"} · {timeAgo(listing.created_at)}
        </p>
        <p className="mt-1 text-base font-bold text-foreground">
          {formatKRW(listing.price)}
        </p>
      </div>
    </Link>
  );
}

export function WantedChip({ listing }: { listing: ListingPreview }) {
  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="block min-w-[240px] flex-shrink-0 rounded-2xl border border-border bg-surface p-4"
    >
      <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
        구해요
      </span>
      <p className="mt-2 line-clamp-1 text-sm font-medium text-foreground">
        {listing.title}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-primary">
          {formatKRW(listing.price)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {timeAgo(listing.created_at)}
        </span>
      </div>
    </Link>
  );
}
