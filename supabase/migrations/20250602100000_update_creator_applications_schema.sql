-- Update creator_applications table to include more detailed information
ALTER TABLE creator_applications
ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other',
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS social_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_youtube TEXT,
ADD COLUMN IF NOT EXISTS social_other TEXT,
ADD COLUMN IF NOT EXISTS content_plan TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT,
ADD COLUMN IF NOT EXISTS pricing_plan TEXT,
ADD COLUMN IF NOT EXISTS terms_agreed BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS age_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Add categories check constraint
ALTER TABLE creator_applications
DROP CONSTRAINT IF EXISTS creator_applications_category_check;

ALTER TABLE creator_applications
ADD CONSTRAINT creator_applications_category_check
CHECK (category IN ('gaming', 'education', 'entertainment', 'consulting', 'art', 'music', 'lifestyle', 'tech', 'other'));

-- Update the insert policy to ensure required fields
DROP POLICY IF EXISTS "Users can create their own applications" ON creator_applications;

CREATE POLICY "Users can create their own applications"
  ON creator_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND terms_agreed = TRUE
    AND age_verified = TRUE
    AND display_name != ''
    AND category != ''
    AND NOT EXISTS (
      SELECT 1 FROM creator_applications
      WHERE user_id = auth.uid()
      AND status IN ('pending', 'approved')
    )
  );