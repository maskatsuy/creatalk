-- Fix user_roles column name from 'role' back to 'role_id'
-- The security fix migration incorrectly changed column names

-- Fix add_default_role function to use correct column name
CREATE OR REPLACE FUNCTION public.add_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Fix handle_creator_approval function to use correct column names and logic
CREATE OR REPLACE FUNCTION public.handle_creator_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- When creator application is approved, add creator role
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Add creator role with ON CONFLICT DO NOTHING
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (NEW.user_id, 'creator')
        ON CONFLICT (user_id, role_id) DO NOTHING;
        
        -- Create creator record with ON CONFLICT DO NOTHING
        INSERT INTO public.creators (id)
        VALUES (NEW.user_id)
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.add_default_role() IS 'Adds default user role when profile is created';
COMMENT ON FUNCTION public.handle_creator_approval() IS 'Adds creator role and creates creator record when application is approved';