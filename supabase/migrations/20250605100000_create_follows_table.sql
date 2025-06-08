-- Create follows table for creator follow functionality
CREATE TABLE public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent self-follows and duplicate follows
    CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id),
    CONSTRAINT follows_unique_pair UNIQUE(follower_id, following_id)
);

-- Create indexes for performance
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_follows_created_at ON public.follows(created_at DESC);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all follows (for public follower/following counts)
CREATE POLICY "Anyone can view follows" ON public.follows
    FOR SELECT USING (true);

-- Users can create follows for themselves
CREATE POLICY "Users can create own follows" ON public.follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows (unfollow)
CREATE POLICY "Users can delete own follows" ON public.follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Add follower/following counts to creator_applications view
-- Update existing creator_applications table to include follower counts
ALTER TABLE public.creator_applications 
ADD COLUMN IF NOT EXISTS follower_count_real INTEGER DEFAULT 0;

-- Create function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the followed user's follower count
    IF TG_OP = 'INSERT' THEN
        UPDATE creator_applications 
        SET follower_count_real = (
            SELECT COUNT(*) FROM follows WHERE following_id = NEW.following_id
        )
        WHERE user_id = NEW.following_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE creator_applications 
        SET follower_count_real = (
            SELECT COUNT(*) FROM follows WHERE following_id = OLD.following_id
        )
        WHERE user_id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update follower counts
CREATE TRIGGER update_follower_count_trigger
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_count();