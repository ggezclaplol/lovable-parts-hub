
-- Add image_url column to community_builds
ALTER TABLE public.community_builds ADD COLUMN image_url text;

-- Create storage bucket for build images
INSERT INTO storage.buckets (id, name, public) VALUES ('build-images', 'build-images', true);

-- Allow authenticated users to upload build images
CREATE POLICY "Authenticated users can upload build images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'build-images');

-- Allow anyone to view build images
CREATE POLICY "Anyone can view build images"
ON storage.objects FOR SELECT
USING (bucket_id = 'build-images');

-- Allow users to delete their own build images
CREATE POLICY "Users can delete own build images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'build-images' AND (storage.foldername(name))[1] = auth.uid()::text);
