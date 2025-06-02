-- Add search and sorting fields to creator_applications table
ALTER TABLE creator_applications
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_call_created_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_creator_applications_follower_count ON creator_applications(follower_count DESC);
CREATE INDEX IF NOT EXISTS idx_creator_applications_created_at ON creator_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_applications_last_call ON creator_applications(last_call_created_at DESC);

-- Insert some dummy data for existing approved applications to test sorting
UPDATE creator_applications 
SET 
  follower_count = FLOOR(RANDOM() * 10000 + 100),
  last_call_created_at = NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)
WHERE status = 'approved';