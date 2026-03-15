-- Drop and recreate the public read policy for stays as PERMISSIVE
DROP POLICY IF EXISTS "Approved stays are publicly readable" ON stays;

CREATE POLICY "Approved stays are publicly readable" ON stays
FOR SELECT
USING (status = 'approved');

-- Also fix the stay_reviews public read policy
DROP POLICY IF EXISTS "Reviews are publicly readable" ON stay_reviews;

CREATE POLICY "Reviews are publicly readable" ON stay_reviews
FOR SELECT
USING (true);