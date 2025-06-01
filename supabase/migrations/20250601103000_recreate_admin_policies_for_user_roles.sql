-- Recreate admin policies for user_roles using the is_admin() helper function
-- to prevent infinite recursion.

-- Drop the simplified SELECT policy created during debugging, as we are now adding a more comprehensive set.
DROP POLICY IF EXISTS "Allow users to select their own user_roles" ON public.user_roles;

-- Policy for users to SELECT their own roles (this should generally exist)
CREATE POLICY "Users can SELECT their own user_roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for admins to SELECT all user roles.
CREATE POLICY "Admins can SELECT all user_roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin());

-- Policy for admins to UPDATE all user roles.
CREATE POLICY "Admins can UPDATE all user_roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin()); -- Ensure the condition still holds for the data being written

-- Policy for admins to DELETE all user roles.
CREATE POLICY "Admins can DELETE all user_roles"
  ON public.user_roles FOR DELETE
  USING (public.is_admin());

-- Note: The INSERT policy "Allow insert into user_roles by authenticated users (intended for triggers)"
-- created in 20250601052413_fix_user_roles_rls_20240601.sql is assumed to be sufficient and correct.
-- If admins also need to directly INSERT into user_roles, a separate admin INSERT policy using is_admin() would be needed. 