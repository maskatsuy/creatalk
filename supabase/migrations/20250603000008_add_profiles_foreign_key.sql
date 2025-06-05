-- Add foreign key relationship between queue_participants and profiles
-- First, let's make sure the profiles table has the correct structure
DO $$ 
BEGIN
    -- Check if profiles table exists, if not create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            display_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view all profiles" ON public.profiles
            FOR SELECT USING (true);
            
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR ALL USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Update the query to use user_id instead of profiles join
-- Since we're joining on user_id, we need to make sure the relationship is clear