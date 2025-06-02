-- Temporarily simplify RLS policy for debugging

-- Drop the current policy
DROP POLICY IF EXISTS "Users can create their own applications" ON creator_applications;

-- Create a more permissive policy for debugging
CREATE POLICY "Users can create their own applications"
  ON creator_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- We'll add back the other constraints once we confirm basic insertion works