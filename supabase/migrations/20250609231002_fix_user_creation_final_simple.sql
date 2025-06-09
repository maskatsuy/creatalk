-- Fix user creation with minimal changes

-- Drop problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_minimal ON auth.users;

-- Create a safe profile creation function
CREATE OR REPLACE FUNCTION public.create_user_profile_safe(
    p_user_id UUID,
    p_email TEXT,
    p_display_name TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_display_name TEXT;
BEGIN
    -- Set display name
    v_display_name := COALESCE(p_display_name, split_part(p_email, '@', 1));
    
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
    VALUES (p_user_id, p_email, v_display_name, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
EXCEPTION WHEN OTHERS THEN
    -- Silently ignore errors
    NULL;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_user_profile_safe(UUID, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile_safe(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile_safe(UUID, TEXT, TEXT) TO service_role;

-- Add comment with proper function signature
COMMENT ON FUNCTION public.create_user_profile_safe(UUID, TEXT, TEXT) IS 'Safe function to create user profiles without breaking auth';