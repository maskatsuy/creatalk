-- Add public access policy for approved creator applications
-- This allows the search functionality to work for anonymous users

CREATE POLICY "Anyone can view approved creator applications"
  ON creator_applications 
  FOR SELECT 
  USING (status = 'approved');