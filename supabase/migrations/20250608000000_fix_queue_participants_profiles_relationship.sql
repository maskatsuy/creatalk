-- Fix the relationship between queue_participants and profiles
-- The issue is that PostgREST can't find a direct foreign key relationship
-- because both tables reference auth.users differently

-- Option 1: Add a proper foreign key (if profiles table structure allows)
-- First check if we can add a foreign key constraint
DO $$ 
BEGIN
  -- Try to add foreign key constraint from queue_participants.user_id to profiles.id
  BEGIN
    ALTER TABLE public.queue_participants 
    ADD CONSTRAINT fk_queue_participants_profiles 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  EXCEPTION
    WHEN others THEN
      -- If constraint fails, create a view instead
      NULL;
  END;
END $$;

-- Option 2: Create a view that makes the relationship explicit
CREATE OR REPLACE VIEW public.queue_participants_with_profiles AS
SELECT 
  qp.*,
  p.display_name,
  p.avatar_url,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at
FROM public.queue_participants qp
LEFT JOIN public.profiles p ON qp.user_id = p.id;

-- Enable RLS for the view
ALTER VIEW public.queue_participants_with_profiles SET (security_invoker = true);

-- Grant permissions
GRANT SELECT ON public.queue_participants_with_profiles TO authenticated;
GRANT SELECT ON public.queue_participants_with_profiles TO anon;