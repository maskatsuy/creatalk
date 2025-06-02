-- Fix infinite recursion in creator_applications RLS policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can create their own applications" ON creator_applications;

-- Create a simpler policy without the recursion issue
CREATE POLICY "Users can create their own applications"
  ON creator_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND terms_agreed = TRUE
    AND age_verified = TRUE
    AND display_name != ''
    AND category != ''
  );

-- We'll handle duplicate prevention at the application level instead of in RLS
-- This avoids the infinite recursion issue