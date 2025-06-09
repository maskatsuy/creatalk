-- Fix user_roles table and the auth trigger

-- First, check current structure of user_roles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        RAISE NOTICE 'user_roles table exists';
    ELSE
        RAISE WARNING 'user_roles table does not exist!';
        
        -- Create user_roles table if it doesn't exist
        CREATE TABLE public.user_roles (
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            role_id TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            PRIMARY KEY (user_id, role_id)
        );
        
        -- Enable RLS
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view their own roles" ON public.user_roles
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Fix the add_default_role function
CREATE OR REPLACE FUNCTION public.add_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Add default 'user' role
    BEGIN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (NEW.id, 'user')
        ON CONFLICT (user_id, role_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE LOG 'Failed to add default role for user %: %', NEW.id, SQLERRM;
    END;
    
    -- Create profile
    BEGIN
        INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(
                NEW.raw_user_meta_data->>'display_name',
                NEW.raw_user_meta_data->>'full_name',
                split_part(NEW.email, '@', 1)
            ),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE LOG 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- Ensure the trigger uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.add_default_role();

-- Fix profiles policies (remove duplicates first)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create clean policies
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Ensure profiles table has proper structure
ALTER TABLE public.profiles
    ALTER COLUMN email DROP NOT NULL,
    ALTER COLUMN display_name DROP NOT NULL,
    ALTER COLUMN avatar_url DROP NOT NULL;