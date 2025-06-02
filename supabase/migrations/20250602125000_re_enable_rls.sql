-- Re-enable RLS with proper policies

-- Re-enable RLS on creator_applications table
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policy first to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own applications" ON creator_applications;

-- Create proper policies
CREATE POLICY "Users can create their own applications"
  ON creator_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND terms_agreed = TRUE
    AND age_verified = TRUE
    AND display_name != ''
    AND category != ''
  );

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own applications" ON creator_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON creator_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON creator_applications;

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON creator_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all applications  
CREATE POLICY "Admins can view all applications" ON creator_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id = 'admin'
    )
  );

-- Admins can update applications
CREATE POLICY "Admins can update applications" ON creator_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id = 'admin'
    )
  );