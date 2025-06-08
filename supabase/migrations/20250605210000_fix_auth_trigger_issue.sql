-- Check and fix auth trigger issues
-- This addresses potential problems with user creation triggers

-- First, check if the trigger exists and drop if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the add_default_role function with better error handling
CREATE OR REPLACE FUNCTION public.add_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Add debug logging
    RAISE LOG 'Creating default role for user: %', NEW.id;
    
    -- Insert default role with better error handling
    BEGIN
        INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
        VALUES (
            NEW.id, 
            'user',
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Successfully created default role for user: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating default role for user %: %', NEW.id, SQLERRM;
        -- Don't re-raise the error to prevent blocking user creation
    END;
    
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.add_default_role();

-- Check if user_roles table exists and has correct structure
DO $$
BEGIN
    -- Ensure user_roles table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        RAISE NOTICE 'user_roles table does not exist, creating it...';
        
        CREATE TABLE public.user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            CONSTRAINT user_roles_user_id_unique UNIQUE(user_id)
        );
        
        -- Enable RLS
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view their own role" ON public.user_roles
            FOR SELECT USING (auth.uid() = user_id);
            
        CREATE POLICY "Admin can view all roles" ON public.user_roles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles ur 
                    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
                )
            );
    END IF;
END $$;

-- Add helpful comment
COMMENT ON FUNCTION public.add_default_role() IS 'Creates default user role with error handling to prevent auth failures';