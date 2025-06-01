-- Temporarily disable triggers to debug infinite recursion

-- Disable trigger that adds default 'user' role on new profile creation
ALTER TABLE public.profiles DISABLE TRIGGER on_profile_created;

-- Disable trigger that handles creator role assignment on application approval
ALTER TABLE public.creator_applications DISABLE TRIGGER on_creator_approval;

-- Disable trigger that creates a profile and potentially other actions on new auth user creation
-- ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- IMPORTANT:
-- Remember to re-enable these triggers after debugging is complete.
-- You can re-enable them using:
-- ALTER TABLE public.profiles ENABLE TRIGGER on_profile_created;
-- ALTER TABLE public.creator_applications ENABLE TRIGGER on_creator_approval;
-- ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created; 