-- Function to check if the current authenticated user has the 'admin' role.
-- This function is SECURITY DEFINER, so it runs with the privileges of the user who defined it,
-- bypassing the RLS policies of the calling user for tables accessed within the function.
-- This helps to avoid infinite recursion when RLS policies themselves need to check for admin role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
-- Set a secure search_path: this is important for SECURITY DEFINER functions
SET search_path = public, extensions
AS $$
BEGIN
  -- Check if the current user (auth.uid()) has the 'admin' role in user_roles
  -- Accessing user_roles here will not trigger RLS policies that call this function again,
  -- because of SECURITY DEFINER and a non-recursive check.
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role_id = 'admin'
  );
END;
$$;

-- Grant execute permission on the function to authenticated users, or specific roles if preferred.
-- Since policies will use this, authenticated users need to be able to execute it.
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated; 