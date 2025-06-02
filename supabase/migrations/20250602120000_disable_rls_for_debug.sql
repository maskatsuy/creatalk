-- Temporarily disable RLS for debugging authentication issues

-- Disable RLS on creator_applications table
ALTER TABLE creator_applications DISABLE ROW LEVEL SECURITY;

-- We'll re-enable this once we confirm the basic insertion works