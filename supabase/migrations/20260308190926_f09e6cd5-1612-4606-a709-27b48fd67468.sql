
-- Create a public storage bucket for shop images
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to shop-images
CREATE POLICY "Authenticated users can upload shop images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'shop-images');

-- Public read access
CREATE POLICY "Shop images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-images');

-- Owners can delete their own uploads
CREATE POLICY "Users can delete own shop images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'shop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
