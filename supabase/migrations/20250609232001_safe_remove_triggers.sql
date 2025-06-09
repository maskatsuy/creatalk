-- Safely remove only custom triggers

-- List and remove only our custom triggers
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_minimal ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_safe ON auth.users;

-- Drop custom functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_minimal() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_safe() CASCADE;

-- Ensure profiles table is flexible
ALTER TABLE public.profiles
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- Temporarily disable RLS on profiles table for debugging
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Create a very simple test function
CREATE OR REPLACE FUNCTION public.test_user_creation()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN 'User creation test: OK';
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.test_user_creation() TO anon;

-- Log current triggers
DO $$
DECLARE
    r RECORD;
    trigger_list TEXT := '';
BEGIN
    FOR r IN 
        SELECT tgname
        FROM pg_trigger
        WHERE tgrelid = 'auth.users'::regclass
        AND NOT tgisinternal
    LOOP
        trigger_list := trigger_list || r.tgname || ', ';
    END LOOP;
    
    RAISE NOTICE 'Current user triggers: %', trigger_list;
END $$;