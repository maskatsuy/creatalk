-- Fix function search_path security warnings
-- This sets explicit search_path for all functions to prevent injection attacks

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Fix update_follower_count function
CREATE OR REPLACE FUNCTION public.update_follower_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment follower count
        UPDATE creator_applications 
        SET follower_count_real = COALESCE(follower_count_real, 0) + 1,
            updated_at = timezone('utc'::text, now())
        WHERE user_id = NEW.following_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement follower count
        UPDATE creator_applications 
        SET follower_count_real = GREATEST(COALESCE(follower_count_real, 0) - 1, 0),
            updated_at = timezone('utc'::text, now())
        WHERE user_id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Fix update_queue_participants_updated_at function
CREATE OR REPLACE FUNCTION public.update_queue_participants_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Fix add_default_role function
CREATE OR REPLACE FUNCTION public.add_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Fix handle_creator_approval function
CREATE OR REPLACE FUNCTION public.handle_creator_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- When creator application is approved, update user role to creator
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.user_id, 'creator')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'creator', updated_at = timezone('utc'::text, now());
    END IF;
    
    RETURN NEW;
END;
$$;

-- Fix decrement_remaining_slots function
CREATE OR REPLACE FUNCTION public.decrement_remaining_slots()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Decrement remaining_slots when a booking is confirmed
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE public.call_products 
        SET remaining_slots = GREATEST(remaining_slots - 1, 0),
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.product_id;
    END IF;
    
    -- Increment remaining_slots when a booking is cancelled
    IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        UPDATE public.call_products 
        SET remaining_slots = remaining_slots + 1,
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Add comment explaining the security fix
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Updated with explicit search_path for security';
COMMENT ON FUNCTION public.update_follower_count() IS 'Updated with explicit search_path for security';
COMMENT ON FUNCTION public.update_queue_participants_updated_at() IS 'Updated with explicit search_path for security';
COMMENT ON FUNCTION public.add_default_role() IS 'Updated with explicit search_path for security';
COMMENT ON FUNCTION public.handle_creator_approval() IS 'Updated with explicit search_path for security';
COMMENT ON FUNCTION public.decrement_remaining_slots() IS 'Updated with explicit search_path for security';