-- Add RLS policies for product_listings management (demo mode - allows all authenticated or anonymous users)

-- Allow inserting new listings
CREATE POLICY "Anyone can insert product listings"
ON public.product_listings
FOR INSERT
WITH CHECK (true);

-- Allow updating listings
CREATE POLICY "Anyone can update product listings"
ON public.product_listings
FOR UPDATE
USING (true);

-- Allow deleting listings
CREATE POLICY "Anyone can delete product listings"
ON public.product_listings
FOR DELETE
USING (true);