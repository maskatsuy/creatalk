-- Re-enable the trigger that handles creator application approvals.
-- This trigger assigns the 'creator' role and creates a record in the 'creators' table
-- when an application status is updated to 'approved'.

ALTER TABLE public.creator_applications ENABLE TRIGGER on_creator_approval; 