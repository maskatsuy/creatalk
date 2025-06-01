-- Re-enable the trigger that adds a default 'user' role when a new profile is created.
-- This is to ensure that new users (and existing users who might be missing it)
-- get a default role, which might resolve the PGRST116 error (0 rows returned).

ALTER TABLE public.profiles ENABLE TRIGGER on_profile_created;

-- The other trigger, on_creator_approval, will remain disabled for now
-- to keep the scope of this change limited. 