-- Existing policies will be dropped and recreated to fix potential infinite recursion issues.

-- Drop the overly broad "Only admins can manage user roles" if it was created by a previous version of the migration.
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;
-- Drop the potentially syntactically incorrect policy if it was attempted
DROP POLICY IF EXISTS "Only admins can SELECT, UPDATE, DELETE user roles" ON public.user_roles;

-- Policy for admins to SELECT user roles.
CREATE POLICY "Admins can SELECT user roles"
  ON public.user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role_id = 'admin'
    )
  );

-- Policy for admins to UPDATE user roles.
CREATE POLICY "Admins can UPDATE user roles"
  ON public.user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role_id = 'admin'
    )
  )
  WITH CHECK ( -- Ensure the condition still holds for the data being written
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role_id = 'admin'
    )
  );

-- Policy for admins to DELETE user roles.
CREATE POLICY "Admins can DELETE user roles"
  ON public.user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role_id = 'admin'
    )
  );

-- Policy for INSERT into user_roles.
CREATE POLICY "Allow insert into user_roles by authenticated users (intended for triggers)"
  ON public.user_roles FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

-- Note: The "User roles are viewable by everyone" (SELECT using true) policy is assumed to be acceptable for now.
-- If stricter SELECT permissions are needed (e.g., users can only see their own roles), that policy should also be updated.
