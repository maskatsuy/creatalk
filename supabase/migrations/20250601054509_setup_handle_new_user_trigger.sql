-- Function to create a profile for a new user from auth.users
-- This function will be triggered when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- The function will run with the privileges of the user who defined it
SET search_path = public -- Ensures the function operates within the public schema
AS $$
BEGIN
  -- Insert a new row into the public.profiles table
  -- The new user's ID and email from auth.users are used.
  -- Ensure your profiles table has 'id' (uuid) and 'email' (text) columns.
  -- Add other columns with default values if necessary, e.g., display_name.
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger to call the handle_new_user function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant execute permission on the function to the supabase_auth_admin role
-- This is often necessary for SECURITY DEFINER functions triggered by auth events.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Optional: If you want to ensure this trigger is the one being used and drop any old ones.
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Then recreate the trigger as above.
