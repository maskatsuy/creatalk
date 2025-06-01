-- Drop all existing SELECT policies on user_roles to ensure a clean state for debugging recursion.
DROP POLICY IF EXISTS "Admins can SELECT user roles" ON public.user_roles;
DROP POLICY IF EXISTS "User roles are viewable by everyone" ON public.user_roles;
DROP POLICY IF EXISTS "TEMP_DEBUG_Allow select access to user_roles" ON public.user_roles;

-- Create a basic SELECT policy allowing users to only see their own roles.
-- This is to test if the admin-specific SELECT policy was causing the infinite recursion.
CREATE POLICY "Allow users to select their own user_roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Other policies (INSERT, UPDATE, DELETE) are left untouched by this migration.
-- If this resolves the recursion, the original "Admins can SELECT user roles" policy
-- needs to be re-evaluated, possibly by using a helper function that doesn't directly
-- re-query user_roles in a way that triggers the same policy, or by ensuring the check for admin
-- status is done via a method that doesn't itself rely on a recursive SELECT on user_roles. 