
-- Enums
DO $$ BEGIN
  CREATE TYPE public.seller_type AS ENUM ('individual', 'business');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_status AS ENUM ('active', 'reserved', 'sold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- profiles additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS seller_type public.seller_type NOT NULL DEFAULT 'individual';

-- listings additions
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS status public.listing_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS listings_category_idx ON public.listings (category);
CREATE INDEX IF NOT EXISTS listings_listing_type_idx ON public.listings (listing_type);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON public.listings (created_at DESC);
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON public.listings (user_id);
CREATE INDEX IF NOT EXISTS listings_region_idx ON public.listings (region);
CREATE INDEX IF NOT EXISTS listings_status_idx ON public.listings (status);
CREATE INDEX IF NOT EXISTS favorites_listing_id_idx ON public.favorites (listing_id);

-- Storage policies for product-images bucket
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload own product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
